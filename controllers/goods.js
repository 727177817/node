const Redis = require('../utils/redis.js');
const Goods = require('../models/goods.js');
const BaseController = require('./basecontroller.js');

/**
 * 商品相关接口
 */
class GoodsController extends BaseController {
    constructor() {
        super();
    }


    /* 获取商品详情
     * @param {String} [goodsId]   goodsId为商品id
     * 
     */
    async getDetail(ctx, next) {
        if (!this.checkUserIntegrity(ctx)) {
            return;
        }

        let user = ctx.user;
        let goodsId = ctx.query.goodsId;
        if (!goodsId) {
            ctx.throw(400, '缺少参数goodsId');
            return;
        }
        let goods = await Goods.detail(goodsId, user.warehouseId);
        ctx.body = goods;
    }


    /* 获取商品详情
     * @param {String} [goodsId]   goodsId为商品id
     * 
     */
    async getHot(ctx, next) {
        if (!this.checkUserIntegrity(ctx)) {
            return;
        }

        let user = ctx.user;
        // 热销商品
        let hotGoods = await Goods.hotGoods(user.warehouseId)
        ctx.body = hotGoods;
    }
}

module.exports = new GoodsController();

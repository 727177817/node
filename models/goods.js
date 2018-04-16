const Model = require('../models/model');

class Goods extends Model {

    constructor() {
        super();
        this.name = 'ecs_goods'
    }

    /*
     * 获取商品列表
     */
    async list(warehouseId) {
        var list = await this.db
            .select().from(this.name).where({'is_delete':0, 'warehouse_id':warehouseId});
        return list
    }
    /*
     * 商品详情
     * @param {String} [goodsId]           商品Id
     */
    async detail(goodsId,warehouseId) {
        var detail = await this.db
            .first().from(this.name).where({'goods_id': goodsId, 'is_delete':0, 'warehouse_id':warehouseId});
        return detail
    }


    /*
     * 获取多个商品详情
     * @param {String} [orderId]   订单Id
     */
    async getListByIds(goodsIds) {
        var ret = await this.db(this.name)
            .select().whereIn('goods_id', [ 9, 44 ]);
        return ret
    }

    /*
     * 获取首页所有分类商品
     */
    async homeCategoryGoods(warehouseId) {
        var list = await this.db
            .select().from(this.name).where({'is_best': 1, 'is_delete': 0, 'warehouse_id' :warehouseId})
        return list
    }

    /*
     * 获取首页热销商品
     */
    async hotGoods(warehouseId) {
        var list = await this.db
            .select().from(this.name).where({'is_hot': 1, 'is_on_sale': 1, 'is_delete':0, 'warehouse_id':warehouseId })
        return list
    }
}
module.exports = new Goods();


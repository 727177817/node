const Redis = require('../utils/redis.js');
const Category = require('../models/category.js');
const Goods = require('../models/goods.js');
const BaseController = require('./basecontroller.js');

/**
 * 商品分类相关接口
 */
class CategoryController extends BaseController {
    constructor() {
        super();
    }

    /*
     * 获取所有分类和分类商品
     */
    async getCategory(ctx, next) {
        // let token = ctx.request.header.token
        // let warehouseId = await Redis.getUser({
        //     key: token,
        //     field: 'warehouseId'
        // })
        // if (!warehouseId) {
        //     ctx.throw(400, '缺少参数warehouseId');
        //     return;
        // }

        if (!this.checkUserIntegrity(ctx)) {
            return;
        }

        // 获取首页商品分类
        let category = await Category.category()
        // 获取分类商品
        let goodsList = await Goods.list(ctx.user.warehouseId)
        for (let i = 0; i < category.length; i++) {
            let categoryGoods = [];
            for (let j = 0; j < goodsList.length; j++) {
                if (category[i].cat_id == goodsList[j].cat_id) {
                    categoryGoods.push(goodsList[j])
                }
            }
            Object.assign(category[i], { goods: categoryGoods })
        }

        ctx.body = category
    }
}

module.exports = new CategoryController();

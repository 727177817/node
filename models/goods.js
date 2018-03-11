const Model = require('../models/model');

class Goods extends Model {

    constructor() {
        super();
    }

    // 商品列表
    async list() {
        var list = await this.db
            .select().from('ecs_goods')
        return list
    }
    /*
     * 商品详情
     * @param {String} [goods_id]           商品Id
     */
    async detail(goods_id) {
        var detail = await this.db
            .first().from('ecs_goods').where('goods_id', goods_id);
        return detail
    }

    /*
     * 获取首页所有分类商品
     */
    async homeCategoryGoods() {
        var list = await this.db
            .select().from('ecs_goods').where('is_best', 1)
        return list
    }

    /*
     * 获取首页热销商品
     */
    async homeGoods() {
        var list = await this.db
            .select().from('ecs_goods').where('is_hot', 1)
        return list
    }
}
module.exports = new Goods();


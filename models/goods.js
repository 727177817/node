const Model = require('../models/model');

class Goods extends Model {

    constructor() {
        super();
        this.name = 'ecs_goods'
    }

    /*
     * 获取分类商品
     * @param {String} [goods_id]           商品Id
     */
    async list() {
        var list = await this.db
            .select().from(this.name).where({'is_delete':0});
        return list
    }
    /*
     * 商品详情
     * @param {String} [goods_id]           商品Id
     */
    async detail(goods_id) {
        var detail = await this.db
            .first().from(this.name).where({'goods_id': goods_id, 'is_delete':0});
        return detail
    }

    /*
     * 获取首页所有分类商品
     */
    async homeCategoryGoods() {
        var list = await this.db
            .select().from(this.name).where({'is_best': 1,'is_delete':0})
        return list
    }

    /*
     * 获取首页热销商品
     */
    async homeGoods() {
        var list = await this.db
            .select().from(this.name).where({'is_hot': 1, 'is_on_sale': 1,'is_delete':0})
        return list
    }
}
module.exports = new Goods();


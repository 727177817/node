const Model = require('../models/model');

class Goods extends Model {

    constructor() {
        super();
    }

    async getList() {
        var list = await this.db
            .select().limit(3).from('ecs_goods')
        return list
    }

    async getDetail(goods_id) {
        var detail = await this.db
            .select().from('ecs_goods').where('goods_id', goods_id);
        return detail
    }

}
module.exports = new Goods();


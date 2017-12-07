const Model = require('../models/model');

class Goods extends Model {

    constructor() {
        super();
    }

    async getList() {
        var ret = await this.db
            .select().limit(3).from('ecs_goods')
        return ret
    }

    async getDetail(goods_id) {
        var ret = await this.db
            .first().from('ecs_goods').where('goods_id', goods_id);
        return ret
    }

}
module.exports = new Goods();


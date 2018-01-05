const Model = require('../models/model');

class Order extends Model {

    constructor() {
        super();
    }

    async getList() {
        var orderInfo = await this.db
            .select().from('ecs_order_info').where('user_id', "1");
        return orderInfo
    }

    async getOrderGoods() {
        var orderGoods = await this.db
            .select().from('ecs_order_goods').where('order_id', "14");
        return orderGoods
    }

    async getDetail(goods_id) {
        var ret = await this.db
            .first().from('ecs_order_info').where('order_sn', "2009051255518");
        return ret
    }

}
module.exports = new Order();


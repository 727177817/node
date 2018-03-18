const Model = require('../models/model');

class Order extends Model {

    constructor() {
        super();
        this.name = 'ecs_order_info'
    }

    async getList(userId,state) {
        var orderInfo = await this.db
            .select().from(this.name).where({'user_id': userId});
            // .select().from(this.name).where({'user_id': userId,'order_status': orderStatus,'pay_status': payStatus});
        return orderInfo
    }

    async getDetail(orderId) {
        var ret = await this.db
            .first().from(this.name).where('order_sn', "2009051255518");
        return ret
    }
     /*
     * 获取订单商品
     * @param {String} [orderId]   订单Id
     */
    async getOrderGoods(orderId) {
        var ret = await this.db('ecs_order_goods')
            .select().where('order_id', orderId);
        return ret
    }

}
module.exports = new Order();


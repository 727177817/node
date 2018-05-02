const Model = require('../models/model');

class Order extends Model {

    constructor() {
        super();
        this.name = 'ecs_order_info'
    }

    async getList(userId) {
        var orderInfo = await this.db
            .select().from(this.name).where({
                'user_id': userId
            });
        return orderInfo
    }

    async getPaidOrders(userId) {
        return await this.db(this.name)
            .select().where({
                'user_id': userId,
                'pay_status': 1
            });
    }

    async getUnpaidOrders(userId) {
        return await this.db(this.name)
            .select().where({
                'user_id': userId,
                'pay_status': 0
            });
    }

    async getOne(orderId) {
        return await this.db(this.name)
            .first().where('order_id', orderId);
    }

    async getOneByOrderSn(orderSn) {
        return await this.db(this.name)
            .first().where('order_sn', orderSn);
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

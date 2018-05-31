const Model = require('../models/model');

class Order extends Model {

    constructor() {
        super();
        this.name = 'ecs_order_info'
    }

    async getList(userId, page, size) {
        var orderInfo = await this.db
            .select().from(this.name).where({
                'user_id': userId
            }).orderBy('add_time', 'desc').limit(this.getSize(size)).offset(this.getPage(page));
        return orderInfo
    }

    async getPaidOrders(userId, page, size) {
        return await this.db(this.name)
            .select().where({
                'user_id': userId,
                'pay_status': 1
            }).orderBy('add_time', 'desc').limit(this.getSize(size)).offset(this.getPage(page));
    }

    async getUnpaidOrders(userId, page, size) {
        return await this.db(this.name)
            .select().where({
                'user_id': userId,
                'pay_status': 0
            }).orderBy('add_time', 'desc').limit(this.getSize(size)).offset(this.getPage(page));
    }

    async getOne(orderId) {
        return await this.db(this.name)
            .first().where('order_id', orderId);
    }

    async getOneByOrderSn(userId, orderSn) {
        return await this.db(this.name)
            .first().where({
                'user_id': userId,
                'order_sn': orderSn
            });
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

    /*
     * 获取多个订单商品
     * @param {String} [orderId]   订单Id
     */
    async getListByIds(goodsIds, orderId) {
        var list = await this.db('ecs_order_goods')
            .select().whereIn('goods_id', goodsIds).where('order_id', orderId);
        return list
    }
}
module.exports = new Order();

const Model = require('../models/model');
const config = require('../config');

class Order extends Model {

    constructor() {
        super();
        this.name = 'ecs_order_info'
    }

    async getByConditionWithPage(condition, page, size) {
        var orderInfo = await this.db
            .select().from(this.name).where(condition)
            .orderBy('add_time', 'desc')
            .limit(this.getSize(size)).offset(this.getPage(page));
        return orderInfo
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
                'pay_status': config.PS_PAYED
            }).orderBy('add_time', 'desc').limit(this.getSize(size)).offset(this.getPage(page));
    }

    async getUnpaidOrders(userId, page, size) {
        return await this.db(this.name)
            .select().where({
                'user_id': userId,
                'pay_status': config.PS_UNPAYED
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
}
module.exports = new Order();

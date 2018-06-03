const Model = require('../models/model');

class OrderGoods extends Model {

    constructor() {
        super();
        this.name = 'ecs_order_goods';
        this.selectedFields = ['ecs_order_goods.*', 'ecs_goods.goods_thumb','ecs_goods.goods_img','ecs_goods.goods_weight'];
    }

    /*
     * 获取订单商品
     * @param {String} [orderId]   订单Id
     */
    async getOrderGoods(orderId) {
        return await this.db(this.name)
            .select(this.selectedFields)
            .leftJoin('ecs_goods', 'ecs_goods.goods_id', 'ecs_order_goods.goods_id')
            .where('order_id', orderId)
            .orderBy('ecs_order_goods.rec_id', 'desc');
    }

    /*
     * 获取多个订单的商品列表
     * @param {String} [orderIds]   订单Ids
     */
    async getByOrderIds(orderIds) {
        return await this.db(this.name)
            .select(this.selectedFields)
            .leftJoin('ecs_goods', 'ecs_goods.goods_id', 'ecs_order_goods.goods_id')
            .whereIn('order_id', orderIds)
            .orderBy('ecs_order_goods.rec_id', 'desc');
    }

}
module.exports = new OrderGoods();

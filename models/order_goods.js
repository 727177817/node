const Model = require('../models/model');

class OrderGoods extends Model {

    constructor() {
        super();
        this.name = 'ecs_order_goods'
    }
    /*
     * 获取多个订单商品
     * @param {String} [orderId]   订单Id
     */
    async getListByIds(goodsIds, orderId) {
        var list = await this.db(this.name)
            .select().where('order_id', orderId).whereIn('goods_id', goodsIds);
        return list
    }
}
module.exports = new OrderGoods();


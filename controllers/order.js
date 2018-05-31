const Order = require('../models/order.js');
const OrderGoods = require('../models/order_goods.js');
const BaseController = require('./basecontroller.js');
const config = require('../config');
const OrderAction = require('../models/order_action.js');

/**
 * 订单相关接口
 */
class OrderController extends BaseController {
    constructor() {
        super();
    }

    /* 
     * 获取订单列表
     * 订单列表分0全部、1待支付、2待发货、3已完成
     * 订单所有状态，1待支付、2待发货、3已发货、4已完成、5已取消、6已退货
     * @param {String} [state]   state为订单状态
     * 默认所有订单
     */
    async getList(ctx, next) {
        let userId = ctx.user.userId;
        let status = ctx.query.status || '0';
        let page = ctx.query.page;
        let size = ctx.query.size;

        let orderList = [];
        switch (status) {
            case '0':
                {
                    orderList = await Order.getList(userId, page, size);
                    break;
                }
            case '1':
                {
                    orderList = await Order.getUnpaidOrders(userId, page, size);
                    break;
                }
            case '2':
                {
                    orderList = await Order.getPaidOrders(userId, page, size);
                    break;
                }
        }

        // 查询订单商品
        for (let i = 0; i < orderList.length; i++) {
            let orderId = orderList[i].order_id
            let orderGoods = await Order.getOrderGoods(orderId);
            // 查询订单所有商品
            let orderGoodsIds = []
            for (let j = 0; j < orderGoods.length; j++) {
                orderGoodsIds.push(orderGoods[j].goods_id)
            }
            // 查询订单商品详细内容
            console.log(orderGoodsIds)
            var orderGoodsList = await OrderGoods.getListByIds(orderGoodsIds, orderId);
            Object.assign(orderList[i], { goods: orderGoodsList })
        }
        ctx.body = orderList
    }


    /* 
     * 获取订单详情
     * @param {String} [order_id]   order_id订单Id
     */
    async getDetail(ctx, next) {
        let userId = ctx.user.userId;
        let orderSn = ctx.query.orderSn
        if (!orderSn) {
            ctx.throw(400, '缺少参数orderSn');
            return;
        }

        let orderInfo = await Order.getOneByOrderSn(userId, orderSn);

        if (!orderInfo) {
            ctx.throw(400, '订单信息不存在');
            return;
        }

        let orderGoods = await Order.getOrderGoods(orderInfo.order_id);
        Object.assign(orderInfo, { goods: orderGoods })
        ctx.body = await orderInfo
    }

    /* 
     * 取消订单
     * @param {String} [order_id]   order_id订单Id
     */
    async postCancel(ctx, next) {
        let userId = ctx.user.userId;
        let { orderSn } = ctx.request.body;
        if (!orderSn) {
            ctx.throw(400, '缺少参数orderSn');
            return;
        }

        let orderInfo = await Order.getOneByOrderSn(userId, orderSn);
        if (!orderInfo) {
            ctx.throw(400, '操作失败，订单信息不存在');
            return;
        }

        //只有未支付订单可以取消
        if (orderInfo.pay_status != config.PS_UNPAYED) {
            ctx.throw(400, '操作失败，只有未支付订单可以取消');
            return;
        }

        // 不重复取消
        if (orderInfo.order_status == config.OS_CANCELED) {
            ctx.throw(400, '操作失败，该订单已取消');
            return;
        }

        // 更新订单状态
        await Order.update({
            order_id: orderInfo.order_id
        }, {
            order_status: config.OS_CANCELED
        });

        // 记录订单操作日志
        let actionNote = '用户主动取消订单';
        let logTime = Math.round(new Date().getTime() / 1000) - 8 * 3600;
        await OrderAction.record(orderInfo.order_id, 'guest', config.OS_CANCELED, orderInfo.shipping_status, orderInfo.pay_status, actionNote, logTime);

        ctx.body = 1;
    }
}

module.exports = new OrderController();

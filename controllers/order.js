const Order = require('../models/order.js');
const OrderGoods = require('../models/order_goods.js');
const BaseController = require('./basecontroller.js');
const config = require('../config');
const OrderAction = require('../models/order_action.js');
const Coupon = require('../models/coupon.js');
const Goods = require('../models/goods.js');
const moment = require('moment');

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
        let condition = {
            user_id: userId
        };
        switch (status) {
            case '0':
                {
                    // 全部订单查询当前用户的所有订单
                    // orderList = await Order.getList(userId, page, size);
                    break;
                }
            case '1':
                {
                    // 待支付订单查询已确定未支付的订单
                    condition.order_status = config.OS_CONFIRMED;
                    condition.pay_status = config.PS_UNPAYED;
                    // orderList = await Order.getUnpaidOrders(userId, page, size);
                    break;
                }
            case '2':
                {
                    // 待发货订单查询已确定已支付未发货的订单
                    condition.order_status = config.OS_CONFIRMED;
                    condition.pay_status = config.PS_PAYED;
                    condition.shipping_status = config.SS_UNSHIPPED;
                    // orderList = await Order.getPaidOrders(userId, page, size);
                    break;
                }
            case '3':
                {
                    // 已完成订单查询已确定已支付已收货的订单
                    condition.order_status = config.OS_CONFIRMED;
                    condition.pay_status = config.PS_PAYED;
                    condition.shipping_status = config.SS_RECEIVED;
                    orderList = await Order.getPaidOrders(userId, page, size);
                    break;
                }
        }
        orderList = await Order.getByConditionWithPage(condition, page, size);

        // 获取所有订单ID
        let orderIds = [];
        orderList.map((order) => {
            orderIds.push(order.order_id);
            order.realStatus = this.getRealStatus(order.order_status, order.shipping_status, order.pay_status);
        });

        // 按订单分组商品
        let allGoods = await OrderGoods.getByOrderIds(orderIds);
        let sortGoods = {};
        allGoods.map((goods) => {
            if (!sortGoods[goods.order_id]) {
                sortGoods[goods.order_id] = [];
            }
            sortGoods[goods.order_id].push(goods);
        });

        // 商品关联到订单上
        orderList.map((order) => {
            order.goods = sortGoods[order.order_id];
        });

        ctx.body = orderList
    }


    /* 
     * 获取订单详情
     * @param {String} [order_id]   order_id订单Id
     */
    async getDetail(ctx, next) {
        let userId = ctx.user.userId;
        let orderSn = ctx.query.orderSn;

        if (!orderSn) {
            ctx.throw(400, '缺少参数orderSn');
            return;
        }

        let orderInfo = await Order.getOneByOrderSn(userId, orderSn);

        if (!orderInfo) {
            ctx.throw(400, '订单信息不存在');
            return;
        }

        orderInfo.realStatus = this.getRealStatus(orderInfo.order_status, orderInfo.shipping_status, orderInfo.pay_status);
        orderInfo.best_time_str = this.format_best_time(orderInfo.best_time);

        let orderGoods = await OrderGoods.getOrderGoods(orderInfo.order_id);
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

        // 不能重复取消
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

        // 如果使用优惠券则退回
        if (orderInfo.bonus_id > 0) {
            await Coupon.setUnUsed(orderInfo.bonus_id);
        }

        // 记录订单操作日志
        let actionNote = '用户主动取消订单';
        let logTime = this.getTimestamp();
        await OrderAction.record(orderInfo.order_id, 'guest', config.OS_CANCELED, orderInfo.shipping_status, orderInfo.pay_status, actionNote, logTime);

        // 取消订单退回库存
        let orderGoods = await OrderGoods.getOrderGoods(orderInfo.order_id);
        orderGoods.map((item) => {
            Goods.changeQuantity(item.goods_id, item.goods_number);
        });

        ctx.body = 1;
    }


    /**
     * 已取消，待支付，待发货，配送中，已完成，退货
     * @return {[type]} [description]
     */
    getRealStatus(orderStatus, shippingStatus, payStatus) {
        if (orderStatus == config.OS_RETURNED) {
            return '已退货';
        } else if (orderStatus == config.OS_CANCELED) {
            return '已取消';
        } else {
            if (payStatus == config.PS_PAYED) {
                if (shippingStatus == config.SS_SHIPPED) {
                    return '配送中';
                } else if (shippingStatus == config.SS_RECEIVED) {
                    return '已完成';
                }
                return '待发货'
            } else {
                return '待支付';
            }
        }
    }

    /**
     * 获取格式化的配送时间
     * 2018-06-05 09:00-09:30
     * @param  {[type]} best_time [description]
     * @return {[type]}           [description]
     */
    format_best_time(best_time) {
        let date = moment.unix(best_time)
        let str1 = date.format('YYYY-MM-DD');
        let str2 = date.format('HH:mm');
        date.add(30, 'minutes');
        let str3 = date.format('HH:mm');

        return str1 + ' ' + str2 + '-' + str3;
    }
}

module.exports = new OrderController();
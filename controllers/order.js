const Order = require('../models/order.js');
const Goods = require('../models/goods.js');


/* 
 * 获取订单列表
 * @param {String} [state]   state为订单装
 * 默认所有订单
*/ 
exports.getList = async (ctx, next) => {
    let orderState = ctx.query.orderState || '',
    payStatus      = ctx.query.payStatus || '',
    userId         = '1'
    if(!ctx.session.user_id){
        ctx.throw(401);
        return;
    }
    let orderList = await Order.getList(userId,orderState,payStatus);
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
        var orderGoodsList = await Goods.getListByIds(orderGoodsIds);
        Object.assign(orderList[i],{goods: orderGoodsList})
    }
    ctx.body = orderList
}


/* 
 * 获取订单详情
 * @param {String} [order_id]   order_id订单Id
*/ 
exports.getDetail = async (ctx, next) => {
    try {
        let orderInfo = await Order.getDetail();
        let orderGoods = await Order.getOrderGoods();
        Object.assign(orderInfo,{goods:orderGoods})
        ctx.body = await orderInfo
    } catch (err) {
        return 'err';
    }
}
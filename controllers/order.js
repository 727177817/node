const Redis    = require('../utils/redis.js');
const Order = require('../models/order.js');
const Goods = require('../models/goods.js');


/* 
 * 获取订单列表
 * @param {String} [state]   state为订单装
 * 默认所有订单
*/ 
exports.getList = async (ctx, next) => {
    let token = ctx.request.header.token
    let userId = await Redis.getUser({
        key: token,
        field: 'userId'
    })
    if(!token || !user.userId){
        ctx.throw(401);
        return;
    }
    let state = ctx.query.state
    if(!orderState){
        ctx.throw(400, '缺少参数orderState');
        return;
    }
    let payStatus = ctx.query.payStatus
    if(!payStatus){
        ctx.throw(400, '缺少参数payStatus');
        return;
    }
    let orderList = await Order.getList(userId,state,payStatus);
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
    let token = ctx.request.header.token
    let userId = await Redis.getUser({
        key: token,
        field: 'userId'
    })
    if(!token || !user.userId){
        ctx.throw(401);
        return;
    }
    let orderSn = ctx.query.orderSn
    if(!orderSn){
        ctx.throw(400, '缺少参数orderSn');
        return;
    }
    try {
        let orderInfo = await Order.getDetail(orderSn);
        let orderGoods = await Order.getOrderGoods(orderSn);
        Object.assign(orderInfo,{goods:orderGoods})
        ctx.body = await orderInfo
    } catch (err) {
        return 'err';
    }
}
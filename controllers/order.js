const Order = require('../models/order.js');


exports.getList = async (ctx, next) => {
    try {
        let orderInfo = await Order.getList();
	  	let orderGoods = await Order.getOrderGoods();
        orderInfo.map((value)=>{
            Object.assign(value,{goods:orderGoods})
        })
        ctx.body = orderInfo
    } catch (err) {
        return 'err';
    }
}



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
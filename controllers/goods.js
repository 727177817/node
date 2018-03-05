const Goods = require('../models/goods.js');


exports.list = async (ctx, next) => {
    try {
        ctx.body = await Goods.getList();
    } catch (err) {
        return 'err';
    }
}


exports.detail = async (ctx, next) => {
    try {
    	let goods = await Goods.getDetail(ctx.query.goods_id); 
	  	ctx.body = goods[0];
    } catch (err) {
        return 'err';
    }
}
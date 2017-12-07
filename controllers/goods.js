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
	  	ctx.body = await Goods.getDetail();
        // let list = await Goods.getList;
    } catch (err) {
        return 'err';
    }
}
const Goods = require('../models/goods.js');
const Cart = require('../models/cart.js');

/**
 * 测试用
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getTest = async(ctx, next) => {

    ctx.session = {
    	userId: 28,
    	suppliersId: 1
    }
    
    ctx.body = ctx.session;
}

/**
 * 获取所有小区信息
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getCommunities = async(ctx, next) => {

    let result = await Cart.getAllWithUser(userId);
    
    ctx.body = result;
}
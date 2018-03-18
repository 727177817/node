const Goods = require('../models/goods.js');
const Cart = require('../models/cart.js');


/**
 * 提交订单
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.postOrder = async(ctx, next) => {

    let userId = ctx.session.userId;
    userId = 28;
    if(!userId){
        ctx.throw(401);
        return;
    }

    let result = await Cart.getAllWithUser(userId);
    
    ctx.body = result;
}
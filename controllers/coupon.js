const Redis    = require('../utils/redis.js');
const Coupon = require('../models/coupon.js');

 /*
 * 获取优惠券列表
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @param {[type]}   0     [类型]
 * @return {[type]}   list     [优惠券列表]
 */ 
exports.getList = async(ctx, next) => {
    let token = ctx.request.header.token
    let userId = await Redis.getUser({
        key: token,
        field: 'userId'
    })
    if(!userId){
        ctx.throw(401);
        return;
    }

    let type = ctx.query.type;
    if(!type){
        ctx.throw(400, '缺少参数type');
        return;
    }

    let list = await Coupon.list(userId, type)
    ctx.body = list;
}

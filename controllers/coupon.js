const Coupon = require('../models/coupon.js');
const BaseController = require('./basecontroller.js');

/**
 * 优惠券相关接口
 */
class CouponController extends BaseController {
    constructor() {
        super();
    }

    /*
     * 获取优惠券列表
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     * @param {[type]}   0    [类型]
     * @return {[type]}   list     [优惠券列表]
     */
    async getList(ctx, next) {
        let type = ctx.query.type || 0;
        if (!type) {
            ctx.throw(400, '缺少参数type');
            return;
        }

        let list = [];
        let userId = ctx.user.userId;
        if (type == 0) {
            list = await Coupon.unused(userId)
        } else if (type == 1) {
            list = await Coupon.used(userId)
        } else if (type == 2) {
            list = await Coupon.expired(userId);
        }
        ctx.body = list;
    }
}

module.exports = new CouponController();

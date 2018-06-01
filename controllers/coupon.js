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
        let type = ctx.query.type || '0';
        let list = [];
        let userId = ctx.user.userId;
        let timestamp = this.getTimestamp();

        switch (type) {
            case '0':
                list = await Coupon.unused(userId, timestamp);
                break;
            case '1':
                list = await Coupon.used(userId, timestamp);
                break;
            case '2':
                list = await Coupon.expired(userId, timestamp);
                break;
        }

        ctx.body = list;
    }
}

module.exports = new CouponController();

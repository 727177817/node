const Coupon = require('../models/coupon.js');
const User = require('../models/user.js');
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

    /*
     * 领取红包
     * 1. 推广固定ID的红包
     * 2. 验证红包领取的有效期，在发放时间之内
     * 3. 限每人领取一个，领完为止
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     */
    async getWantMoney(ctx, next) {
        let id = ctx.query.id;
        let timestamp = this.getTimestamp();

        if (!id) {
            ctx.throw(400, '参数错误，缺少id');
            return;
        }

        let ctype = await Coupon.getTypeById(id);

        if (!ctype) {
            ctx.throw(400, '活动不存在');
            return;
        }

        if (ctype.send_end_date < timestamp) {
            ctx.throw(400, '活动已结束');
            return;
        }

        if (ctype.send_start_date > timestamp) {
            ctx.throw(400, '活动未开始');
            return;
        }

        let oneCoupons = await Coupon.getCouponByTypeIdAndUserId(ctype.type_id, ctx.user.userId);
        if (oneCoupons.length > 0) {
            ctx.throw(400, '你已领取过该红包');
            return;
        }

        let limitCoupons = await Coupon.getLimitCouponByTypeId(ctype.type_id);
        if (!limitCoupons || limitCoupons.length == 0) {
            ctx.throw(400, '红包已领完');
            return;
        }

        let res = await Coupon.update(limitCoupons[0].bonus_id, {
            user_id: ctx.user.userId
        })

        // let bPigs = await Coupon.getBCouponByTypeId(ctype.type_id);
        // let userIds = [];
        // bPigs.map((item) => {
        //     userIds.push(item.user_id);
        // });
        // let pUsers = await User.getListByIds(userIds);

        ctx.body = res;
    }

    /*
     * 获取领取红包
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     */
    async getWantMoneyUsers(ctx, next) {
        let id = ctx.query.id;
        let timestamp = this.getTimestamp();

        if (!id) {
            ctx.throw(400, '参数错误，缺少id');
            return;
        }

        let ctype = await Coupon.getTypeById(id);

        if (!ctype) {
            ctx.throw(400, '活动不存在');
            return;
        }

        if (ctype.send_end_date < timestamp) {
            ctx.throw(400, '活动已结束');
            return;
        }

        if (ctype.send_start_date > timestamp) {
            ctx.throw(400, '活动未开始');
            return;
        }

        let bPigs = await Coupon.getBCouponByTypeId(ctype.type_id);
        let userIds = [];
        bPigs.map((item) => {
            userIds.push(item.user_id);
        });
        let pUsers = await User.getListByIds(userIds);

        ctx.body = pUsers;
    }
}

module.exports = new CouponController();

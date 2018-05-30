const BaseController = require('./basecontroller.js');

/**
 * 支付回调
 */
class NotifyController extends BaseController {
    constructor() {
        super();
    }

    /*
     * 微信支付回调
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     * @param {[type]}   id     [地址Id]
     * @return {[type]}   detail     [地址详情]
     */
    async postWechat(ctx, next) {

        let id = ctx.query.id;
        if (!id) {
            ctx.throw(400, '缺少参数addressId');
            return;
        }

        ctx.body = detail;
    }
}

module.exports = new NotifyController();

const BaseController = require('./basecontroller.js');
const Order = require('../models/order.js');
const PayLog = require('../models/pay_log.js');
const config = require('../config');
const WechatPay = require('../libs/payment/wechat/wechat_pay.js');

/**
 * 支付回调
 */
class NotifyController extends BaseController {
    constructor() {
        super();

        this.PAY_UNKONW = '';
        this.PAY_SUCCESS = 'SUCCESS';
        this.PAY_FAIL = 'FAIL';
        this.PAY_SECURITY_FAIL = 'FAIL';
    }

    /*
     * 微信支付回调
     * @param  {[type]}   ctx  [description]
     * @param {[type]}   id     [地址Id]
     * @return {[type]}   detail     [地址详情]
     */
    async postWechat(ctx) {
        let wechatPay = new WechatPay();
        let body = ctx.request.body;
        let $code = this.PAY_UNKONW;

        if (body) {
            body = body.xml;
            //兼容解析微信的参数，转换值
            for (var i in body) {
                if (Array.isArray(body[i])) {
                    body[i] = body[i][0];
                }
            }

            let $billno = body['out_trade_no'];
            let payInfo = await PayLog.getOne($billno);

            if (payInfo && payInfo.is_paid == 0) {
                let $result = wechatPay.notify(body, payInfo);
                
                if ($result == 1) {
                    $code = this.PAY_SUCCESS;
                    //校验通过更改订单状态
                    await PayLog.update({
                        log_id: payInfo.log_id
                    }, {
                        is_paid: 1
                    });
                    await Order.update({
                        order_id: payInfo.order_id,
                        pay_time: Math.round(new Date().getTime() / 1000)
                    }, {
                        pay_status: config.PS_PAYED
                    });
                    
                } else if ($result == -1) {
                    $code = this.PAY_FAIL;
                } else if ($result == -2) {
                    $code = this.PAY_SECURITY_FAIL;
                }
            }
        }

        ctx.type = 'application/xml; charset=utf-8';
        ctx.body = wechatPay.getNotifyMeta($code);
    }
}

module.exports = new NotifyController();

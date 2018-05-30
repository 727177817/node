const BaseController = require('./basecontroller.js');
const PayLog = require('../models/pay_log.js');
const WechatPay = require('../libs/payment/wechat/wechat_pay.js');

/**
 * 支付回调
 */
class NotifyController extends BaseController {
    constructor() {
        super();

        this.PAY_SUCCESS = 1;
        this.PAY_FAIL = -1;
        this.PAY_SECURITY_FAIL = -2;
    }

    getTest(ctx){
        ctx.body = 1;
    }

    /*
     * 微信支付回调
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     * @param {[type]}   id     [地址Id]
     * @return {[type]}   detail     [地址详情]
     */
    async postWechat(ctx, $response) {
        console.log('postWechat');
        let wechatPay = new WechatPay();
        // $response = (array) simplexml_load_string($response, 'SimpleXMLElement', LIBXML_NOCDATA);
        $response = wechatPay.toArray($response);
        console.log($response);

        if ($response) {

            $billno = $response['out_trade_no'];
            $callInfo = PayLog.getOne($billno);

            // if (empty($callInfo) && strlen($billno) == 14) {
            //     $order_id = substr($billno, 0, 12);
            //     paymentUtil::getInstance() - > updateBillNo($order_id, $billno);
            //     $callInfo = paymentUtil::getInstance() - > getCallInfo($order_id);
            // }

            if ($callInfo) {
                $result = wechatPay.notify($response, $callInfo);

                if ($result == 1) {
                    $code = this.PAY_SUCCESS;
                }
                elseif($result == -1) {
                    $code = this.PAY_FAIL;
                }
                elseif($result == -2) {
                    $code = this.PAY_SECURITY_FAIL;
                }

                return array(
                    'code' => $code,
                    'callinfo' => $callInfo,
                    'response' => $response
                );
            }
        }

        return array(
            'code' => self::PAY_UNKONW,
            'callinfo' => '',
            'response' => $response
        );
    }
}

module.exports = new NotifyController();

const config = require('../../../config');
const WechatUtil = require('./wechat_util.js');

/**
 * 微信公众帐号支付-基类
 * @author yangcui
 */
class WechatPay {

    constructor() {
        this.appid = config.wechat_appid;

        this.nonce_str = '';

        this.mch_id = config.wechat_pay.mch_id;

        this.secret_key = config.wechat_pay.secret_key;

        this.order_api = '';

        this.query_api = '';

        this.close_api = '';

        this.refund_api = '';

        this.auth_url = '';

        this.refund_query_api = '';

        this.download_bill_api = '';

        this.signkey_api = '';

        this.notify_url = config.wechat_pay.notify_url;

        this.cert_file = '';

        this.private_file = '';

        this.apiclient_cert = {};

        this.SIGN_TYPE = 'md5';

        this.auth_url = config.WX_AUTH_API;
        this.order_api = config.WX_ORDER_API;
        this.query_api = config.WX_QUERY_API;
        this.close_api = config.WX_CLOSE_API;
        this.refund_api = config.WX_REFUND_API;
        this.signkey_api = config.WX_SIGNKEY_API;
        this.refund_query_api = config.WX_REFUND_QUERY_API;
        this.download_bill_api = config.WX_DOWNLOAD_BILL_API;

        this.nonce_str = WechatUtil.create_noncestr(32);

        this.set_apiclient_cert('apiclient_cert.pem', 'apiclient_key.pem');
    }


    set_key($key) {
        this.secret_key = $key;
    }

    set_sandbox_key() {
        this.mch_id = WX_MCHID;

        this.secret_key = WX_SECRET_KEY;

        $resp = this.getsignkey();

        //sandbox env
        this.secret_key = $resp['info']['sandbox_signkey'];
    }

    set_appid($appid) {
        this.appid = $appid;
    }

    set_mchid($mch_id) {
        this.mch_id = $mch_id;
    }

    set_notify($notify_url) {
        this.notify_url = $notify_url;
    }


    set_signCert($signCertfile, $signCertkey) {
        this.cert_file = $signCertfile;
        this.private_file = $signCertkey;
    }

    set_apiclient_cert($cert_file, $cert_key) {
        this.apiclient_cert = {
            'cert': config.CERT_ROOT + "wechat/" + $cert_file,
            'key': config.CERT_ROOT + "wechat/" + $cert_key
        };
    }

    /**
     * 统一下单接口
     *
     * @param array $payinfo 订单参数
     * @return string prepay_id、code_url
     */
    async unifiedorder($payinfo) {
        let $params = {};

        $params['appid'] = this.appid;
        $params['body'] = '天天果园-订单';
        $params['mch_id'] = $payinfo['mch_id'];
        $params['nonce_str'] = this.nonce_str;
        $params['total_fee'] = $payinfo['total_fee'];
        $params['trade_type'] = $payinfo['trade_type'];
        $params['notify_url'] = this.notify_url;
        $params['out_trade_no'] = $payinfo['billno'];

        if ($payinfo['openid']) {
            $params['openid'] = $payinfo['openid'];
        }

        if ($payinfo['scene_info']) {
            $params['scene_info'] = $payinfo['scene_info'];
        }

        if ($payinfo['trade_type'] == 'NATIVE') {
            $params['product_id'] = $payinfo['order_id'];
        }

        if ($payinfo['spbill_create_ip']) {
            $params['spbill_create_ip'] = $payinfo['spbill_create_ip'];
        } else {
            // $params['spbill_create_ip'] = paymentUtil::getInstance() - > getClientIp();
        }

        $params = this.sortObject($params);

        $params['sign'] = this.unifiedsign($params, 'md5');

        let $xmlInfo = WechatUtil.arrayToXml($params);
        let $response = await WechatUtil.request(this.order_api, $xmlInfo);
        let $result = WechatUtil.toArray($response.data);

        // $log = "-----------------------".date("Y-m-d H:i:s").
        // "-----------------------\r\n";
        // $log. = var_export($params, true).
        // "\r\n".var_export($result, true).
        // "\r\n";
        // paymentUtil::getInstance() - > write_log($log, 'unifiedorder');
        console.log($params, $result);

        if ($result && $result['return_code'] == 'SUCCESS' && $result['result_code'] == 'SUCCESS') {
            if ($result['trade_type'] == 'JSAPI' || $result['trade_type'] == 'APP' || $result['trade_type'] == 'WAP') {
                return $result['prepay_id'];
            } else if ($result['trade_type'] == 'NATIVE') {
                return $result['code_url'];
            } else if ($result['trade_type'] == 'MWEB') {
                return $result['mweb_url'];
            }
        }

        return '';
    }


    closeorder($order_id) {
        $params = array();

        $params['appid'] = this.appid;
        $params['mch_id'] = this.mch_id;
        $params['out_trade_no'] = $order_id;
        $params['nonce_str'] = this.nonce_str;

        this.sortObject($params);

        $params['sign'] = this.unifiedsign($params, 'md5');

        // $xmlInfo = paymentUtil::getInstance() - > arrayToXml($params);
        // $response = paymentUtil::getInstance() - > request(this.close_api, $xmlInfo);
        // $result = paymentUtil::getInstance() - > toArray($response);

        // $log = "-----------------------".date("Y-m-d H:i:s").
        // "-----------------------closeorder\r\n";
        // $log. = var_export($params, true).
        // "\r\n".var_export($result, true).
        // "\r\n";
        // paymentUtil::getInstance() - > write_log($log, 'unifiedorder');

        if ($result && $result['return_code'] == 'SUCCESS') {
            return isset($result['err_code']) ? $result['err_code'] : 'SUCCESS';
        } else {
            return 'FAIL';
        }
    }

    /**
     * 支付通知API
     */
    notify($response, $payinfo) {
        $post_sign = $response['sign'];
        unset($response['sign']);
        this.sortObject($response);
        $pay_sign = this.unifiedsign($response, 'md5');

        if (strtolower($pay_sign) == strtolower($post_sign)) {
            if ($response['return_code'] == 'SUCCESS' && $response['result_code'] == 'SUCCESS') {
                // $price = (int) bcmul($payinfo['price'], 100);
                $total_fee = $response['total_fee'];
                if ($price == $total_fee) {
                    return 1; // pay success
                } else {
                    return -1; // pay fail
                }
            } else {
                return -1; // pay fail
            }
        } else {
            return -2; // verify sign fail
        }
    }


    /**
     * 订单查询
     */
    orderquery($order_id, $real_order = false) {
        if ($real_order) {
            $params['out_trade_no'] = $order_id;
        } else {
            // $callInfo = paymentUtil::getInstance() - > getCallInfo($order_id);
            $params['out_trade_no'] = $callInfo['billno'];
        }
        $params['appid'] = this.appid;
        $params['mch_id'] = this.mch_id;
        // $params['nonce_str'] = paymentUtil::getInstance() - > create_noncestr(32);

        // this.sortObject($params);
        // $params['sign'] = this.unifiedsign($params, 'md5');
        // $xmlInfo = paymentUtil::getInstance() - > arrayToXml($params);
        // $response = paymentUtil::getInstance() - > request(this.query_api, $xmlInfo);
        // $response = paymentUtil::getInstance() - > toArray($response);

        // $post_sign = $response['sign'];
        // unset($response['sign']);
        // this.sortObject($response);
        // $pay_sign = this.unifiedsign($response, 'md5');

        if (strtolower($pay_sign) == strtolower($post_sign)) {
            if ($response['return_code'] == 'SUCCESS' && $response['result_code'] == 'SUCCESS') {
                return {
                    'result': true,
                    'info': $response
                };
            } else {
                if ($real_order === false && $order_id != $params['out_trade_no']) {
                    return this.orderquery($order_id, true);
                } else {
                    return {
                        'result': false,
                        'info': $response
                    };
                }
            }
        } else {
            return {
                'result': false,
                'info': $response
            };
        }
    }



    /**
     * 退款
     */
    refund($params) {
        $postParams = [];

        $postParams['appid'] = this.appid;
        $postParams['mch_id'] = this.mch_id;
        // $postParams['nonce_str'] = paymentUtil::getInstance() - > create_noncestr(32);
        $postParams['out_trade_no'] = $params['order_id'];
        $postParams['out_refund_no'] = $params['refund_id'];
        $postParams['total_fee'] = $params['total_fee'];
        $postParams['refund_fee'] = $params['refund_fee'];

        this.sortObject($postParams);
        $postParams['sign'] = this.unifiedsign($postParams);

        $certFile = {
            'cert': CERT_ROOT + "wechat/apiclient_cert.pem",
            'key': CERT_ROOT + "wechat/apiclient_key.pem"
        };

        // $xmlInfo = paymentUtil::getInstance() - > arrayToXml($postParams);
        // $respInfo = paymentUtil::getInstance() - > curl_post_ssl(this.refund_api, $xmlInfo, 6, [], this.apiclient_cert);
        // $response = paymentUtil::getInstance() - > toArray($respInfo);

        $post_sign = $response['sign'];

        unset($response['sign']);
        this.sortObject($response);
        $pay_sign = this.unifiedsign($response, 'md5');

        $log = "-----------------------".date("Y-m-d H:i:s") + "-----------------------refundPost\r\n";
        $log += $pay_sign + " \t ".$post_sign + "\r\n";
        $log += var_export($response, true) + "\r\n";
        // paymentUtil::getInstance() - > write_log($log, 'refund');

        if (strtolower($pay_sign) == strtolower($post_sign)) {
            if ($response['return_code'] == 'SUCCESS' && $response['result_code'] == 'SUCCESS') {
                return {
                    'result': true,
                    'info': $response
                };
            }
        }

        return { 'result': false };
    }


    /**
     * 退款查询
     */
    refund_query($params) {
        $postParams = [];

        $postParams['appid'] = this.appid;
        $postParams['mch_id'] = this.mch_id;
        // $postParams['nonce_str'] = paymentUtil::getInstance() - > create_noncestr(32);
        $postParams['out_refund_no'] = $params['refund_id'];

        this.sortObject($postParams);
        $postParams['sign'] = this.unifiedsign($postParams);

        // $xmlInfo = paymentUtil::getInstance() - > arrayToXml($postParams);
        // $respInfo = paymentUtil::getInstance() - > request(this.refund_query_api, $xmlInfo);
        // $response = paymentUtil::getInstance() - > toArray($respInfo);

        $post_sign = $response['sign'];
        unset($response['sign']);
        this.sortObject($response);
        $pay_sign = this.unifiedsign($response, 'md5');

        if (strtolower($pay_sign) == strtolower($post_sign)) {
            if ($response['return_code'] == 'SUCCESS' && $response['result_code'] == 'SUCCESS') {
                return {
                    'result': true,
                    'info': $response
                };
            }
        }

        return { 'result': false };
    }


    /**
     * 获取验签秘钥API
     */
    getsignkey() {
        // $nonce_str = paymentUtil::getInstance() - > create_noncestr(32);

        $postParams = {
            'mch_id': this.mch_id,
            'nonce_str': $nonce_str
        };

        this.sortObject($postParams);
        $postParams['sign'] = this.unifiedsign($postParams);

        // $xmlInfo = paymentUtil::getInstance() - > arrayToXml($postParams);
        // $respInfo = paymentUtil::getInstance() - > request(this.signkey_api, $xmlInfo);
        // $response = paymentUtil::getInstance() - > toArray($respInfo);

        $post_sign = $response['sign'];
        unset($response['sign']);
        this.sortObject($response);
        $pay_sign = this.unifiedsign($response, 'md5');

        if (strtolower($pay_sign) == strtolower($post_sign)) {
            if ($response['return_code'] == 'SUCCESS') {
                return { 'result': true, 'info': $response };
            }
        }

        return { 'result': false, 'info': $response };
    }


    /**
     * 下载对账单
     */
    downloadbill($bill_date, $bill_type) {
        // $nonce_str = paymentUtil::getInstance() - > create_noncestr(32);

        $postParams = {
            'appid': this.appid,
            'mch_id': this.mch_id,
            'bill_date': $bill_date,
            'bill_type': $bill_type,
            'nonce_str': $nonce_str
        };

        this.sortObject($postParams);
        $postParams['sign'] = this.unifiedsign($postParams);

        // $xmlInfo = paymentUtil::getInstance() - > arrayToXml($postParams);
        // $respInfo = paymentUtil::getInstance() - > request(this.download_bill_api, $xmlInfo);
        // $response = paymentUtil::getInstance() - > toArray($respInfo);

        $post_sign = $response['sign'];
        unset($response['sign']);
        this.sortObject($response);
        $pay_sign = this.unifiedsign($response, 'md5');

        if (strtolower($pay_sign) == strtolower($post_sign)) {
            if ($response['return_code'] == 'SUCCESS') {
                return { 'result': true, 'info': $response };
            }
        }

        return { 'result': false, 'info': $response };

    }


    /**
     * 签名
     */
    unifiedsign($data, $signType = 'md5') {
        let $strInfo = '';
        for (var $key in $data) {
            if ($data[$key] === '') {
                continue;
            }
            if ($strInfo) {
                $strInfo += "&" + $key + "=" + $data[$key];
            } else {
                $strInfo = $key + "=" + $data[$key];
            }
        }

        if ($signType == 'md5') {
            return this.md5($strInfo + '&key=' + this.secret_key).toUpperCase();
        } else if ($signType == 'sha1') {
            return sha1($strInfo + '&key=' + this.secret_key);
        }
    }


    /**
     * 支付通知结果的回执
     */
    getNotifyMeta($status) {
        if ($status == 'SUCCESS') {
            return "<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>";
        } else if ($status == 'FAIL') {
            return "<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>";
        } else {
            return '';
        }
    }

    async dopay($payments) {
        let $total_fee = Math.round($payments['price'] * 100);

        // this.set_appid($this - > appid);
        // this.set_key($this - > secret_key);
        // this.set_notify($this - > notify_url);

        let $prepay_id = await this.unifiedorder({
            'price': $total_fee,
            'billno': $payments['billno'] || '110',
            'order_id': $payments['order_id'],
            'openid': $payments['openid'],
            'total_fee': $total_fee,
            'trade_type': 'JSAPI',
            'mch_id': this.mch_id
        });

        if (!$prepay_id) {
            return {
                'code': false,
                'payData': null
            };
        }

        let $payinfo = {
            'appId': this.appid,
            'timeStamp': new Date().getTime(),
            'signType': this.SIGN_TYPE.toUpperCase(),
            'nonceStr': WechatUtil.create_noncestr(32),
            'package': "prepay_id=" + $prepay_id
        };

        this.sortObject($payinfo);
        $payinfo['paySign'] = this.unifiedsign($payinfo, this.SIGN_TYPE);

        return $payinfo;
    }

    sortObject(o) {
        return Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});
    }

    md5(s) {
        var crypto = require('crypto');
        var md5 = crypto.createHash("md5");
        md5.update(s);
        return md5.digest('hex');
        // return str.toUpperCase();
    }
}

module.exports = WechatPay;

const https = require('https');
const { URL } = require('url');
const axios = require('axios');

/**
 * @desc 支付工具类
 * @auth cuiyang
 */
class WechatUtil {

    constructor() {

    }

    checkDatetime($str, $format = "Y-m-d H:i:s") {
        $unixTime = strtotime($str);
        $checkDate = date($format, $unixTime);
        if ($checkDate == $str) {
            return true;
        } else {
            return false;
        }
    }


    redirect($url) {}


    response($resp) {}


    signParams() {
        // ksort($parma);
        // reset($parma);    
        // $mac = "";
        // foreach($parma as $k=>$v){
        //  $mac += "&{$k}={$v}";
        // }
        // $mac = substr($mac, 1);
        // return md5( $mac + $mer_key );
    }


    getCallInfo($order_id) {
        // $CI =& get_instance();
        // $CI->load->model('webapi/call');
        // return $CI->call->getCallInfoById( $order_id );
    }

    getRefundInfo($order_id) {
        // $CI =& get_instance();
        // $CI->load->model('refund');
        // return $CI->refund->getCallInfoById( $order_id );
    }

    getCallInfoByBillNo($billno) {
        // $CI =& get_instance();
        // $CI->load->model('webapi/call');
        // return $CI->call->getCallInfoByBillNo( $billno );
    }

    //根据微信out_trade_no获取真实的order_id
    getOrderIdByTradeNo($out_trade_no) {
        $trade_no_len = strlen($out_trade_no);
        $trade_no_prefix = substr($out_trade_no, 0, 1);

        if ($trade_no_prefix == 'P') { //P打头为APP订单
            if ($trade_no_len == 15) {
                return $out_trade_no;
            } else if ($trade_no_len == 19) {
                return substr($out_trade_no, 0, 15);
            }
        } else if (is_numeric($trade_no_prefix)) { //数字打头的普通订单
            if ($trade_no_len == 12) {
                return $out_trade_no;
            } else if ($trade_no_len == 16) {
                return substr($out_trade_no, 0, 12);
            }
        } else { //其他字母打头的特殊订单
            if ($trade_no_len == 13) {
                return $out_trade_no;
            } else if ($trade_no_len == 17) {
                return substr($out_trade_no, 0, 13);
            }
        }

        return '';
    }


    updateBillNo($order_id, $billno) {
        // $CI =& get_instance();
        // $CI->load->model('webapi/call');
        // return $CI->call->updateBillNo( $billno, $order_id );
    }

    loadRedis() {
        // $redis = new Redis();
        // $redis->connect( REDIS_HOST, REDIS_PORT, REDIS_TIMEOUT );
        // $redis->auth( REDIS_PASSWORD );
        // return $redis;
    }

    /**
     * @desc 创建指定长度的字符串
     * @param length 字符串长度
     * @return string
     */
    create_noncestr($length = 16) {
        let $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let $str = "";
        for (var $i = 0; $i < $length; $i++) {
            $str += $chars.substr(Math.round(Math.random() * $chars.length), 1);
        }
        return $str;
    }


    /**
     * @desc 创建二维码
     * @param value 数据
     * @return img
     */
    createQrcode($value) {
        // require_once(  FCPATH . "system/libraries/qrcode/qrlib.php" );

        // $errorCorrectionLevel = 'L';
        // $matrixPointSize = 6;
        // QRcode::png($value, false, $errorCorrectionLevel, $matrixPointSize);

        // exit;
    }


    /**
     * @desc 数组转换成xml
     * @param $arr array
     * @return xml
     */
    arrayToXml($arr) {
        let $xml = "<xml>";
        for (var $key in $arr) {
            let $val = $arr[$key];

            if (!isNaN($val)) {
                $xml += "<" + $key + ">" + $val + "</" + $key + ">";

            } else {
                $xml += "<" + $key + "><![CDATA[" + $val + "]]></" + $key + ">";
            }
        }
        $xml += "</xml>";
        return $xml;
    }


    /**
     * @desc 解析xml文件流为数组
     * @param $xml XML Document
     * @return array
     */
    toArray($xml) {
        $reg = "/<(\\w+)[^>]*?>([\\x00-\\xFF]*?)<\\/\\1>/";

        // if(preg_match_all($reg, $xml, $matches))
        // {
        //     $count = count($matches[0]);
        //     $arr = array();
        //     for($i = 0; $i < $count; $i++)
        //     {
        //         $key= $matches[1][$i];
        //         $val = $this->toArray( $matches[2][$i] );
        //         if(array_key_exists($key, $arr))
        //         {
        //             if(is_array($arr[$key]))
        //             {
        //                 if(!array_key_exists(0,$arr[$key]))
        //                 {
        //                     $arr[$key] = array($arr[$key]);
        //                 }
        //             }else{
        //                 $arr[$key] = array($arr[$key]);
        //             }
        //             $arr[$key][] = str_replace(array('<![CDATA[', ']]>'), '', $val);

        //         }else{
        //             $arr[$key] = str_replace(array('<![CDATA[', ']]>'), '', $val);
        //         }
        //     }
        //     return $arr['xml'] ? $arr['xml'] : $arr;
        // }else{
        //     return $xml;
        // }
    }

    /**
     * 通用日志函数
     * $content string 日志内容
     * $module string 日志业务模块
     * $slice string 日志分割类型（按天分：day，按月分：month）
     * $type string 日志类型(运行日志：run、错误日志：error、输出日志：output)
     */
    write_log($content, $module, $slice = 'day', $type = 'run') {
        //NOLOG指令
        // if( defined('NOLOG') && NOLOG === TRUE ){
        //     if( $module == 'cronNoticeQueue' || $module == 'notice' || $module == 'unifiedorder' ){
        //         return;
        //     }else{
        //         return;
        //     }
        // }

        // $boot = RUN_LOG_ROOT;

        // // boot目录不存在，非生产环境
        // if( !file_exists($boot) ){
        //     return false;
        // }

        // if( $slice == 'month' ){
        //     $dir = $boot . $module . "/";
        // }else{
        //     $dir = $boot . $module . "/" . date("Y_m") . "/";
        // }

        // if( !file_exists($dir) ){
        //     mkdir( $dir, 0700, true );
        // }


        // if( $slice == 'month' ){
        //     $file = $dir . $type . "_" . date("Ym") . ".log";
        // }else{
        //     $file = $dir . $type . "_" . date("Ymd") . ".log";
        // }

        // error_log( $content, 3, $file );
    }

    apireq(url) {

        return new Promise((resolve, reject) => {
            return request.get(url, (err, response, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(body);
                }
            });
        });
    }

    /**
     * 执行一个 HTTP GET请求
     *
     * @param string $url 执行请求的url
     * @return array 返回网页内容
     */
    async request($url, $post_data = '') {
        return await axios({
          method: 'post',
          url: $url,
          data: $post_data
        });

        const urlObj = new URL($url);

        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname,
            method: 'POST',
        };
        console.log(options);

        const req = https.request(options, (res) => {
            res.on('data', (chunk) => {
                console.log(`BODY: ${chunk}`);
            });
            res.on('end', (d) => {
                console.log('end');
            });
        });

        req.on('error', (e) => {
            console.error(e);
        });
        req.write($post_data);
        req.end();

        // $curl = curl_init();
        // curl_setopt($curl, CURLOPT_URL, $url);
        // curl_setopt($curl, CURLOPT_HEADER, false);
        // curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        // curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 3);
        // curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        // curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);

        // if ($post_data) {
        //     curl_setopt($curl, CURLOPT_POST, 1);
        //     curl_setopt($curl, CURLOPT_POSTFIELDS, $post_data);
        // }

        // $res = curl_exec($curl);

        // if ($res === false) {
        //     $err = curl_error($curl);
        //     $log = "-----------------------".date("Y-m-d H:i:s").
        //     "-----------------------curl_error\r\n";
        //     $log. = $url.
        //     "\r\n";
        //     $log. = $err.
        //     "\r\n";
        //     $this - > write_log($log, 'warning');
        // }

        // curl_close($curl);
        // return $res;
    }




    /**
     * 执行一个 HTTP POST请求
     *
     * @param string $url 执行请求的url
     * @param string $sData post数据
     * @param string $second Time Out
     * @param string $aHeader set Header
     * @param string $aCertfile cert file path
     * @return array 返回网页内容
     */
    curl_post_ssl($url, $sData, $second = 30, $aHeader = array(), $aCertfile = array()) {
        // $ch = curl_init();

        // curl_setopt($ch, CURLOPT_TIMEOUT, $second);
        // curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

        // curl_setopt($ch, CURLOPT_URL, $url);
        // curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        // curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        // if (isset($aCertfile['cert'])) {
        //     curl_setopt($ch, CURLOPT_SSLCERTTYPE, 'PEM');
        //     curl_setopt($ch, CURLOPT_SSLCERT, $aCertfile['cert']);
        // }

        // if (isset($aCertfile['key'])) {
        //     curl_setopt($ch, CURLOPT_SSLKEYTYPE, 'PEM');
        //     curl_setopt($ch, CURLOPT_SSLKEY, $aCertfile['key']);
        // }

        // if (count($aHeader) >= 1) {
        //     curl_setopt($ch, CURLOPT_HTTPHEADER, $aHeader);
        // }

        // if ($sData) {
        //     curl_setopt($ch, CURLOPT_POST, 1);
        //     curl_setopt($ch, CURLOPT_POSTFIELDS, $sData);
        // }

        // $data = curl_exec($ch);
        // if ($data) {
        //     curl_close($ch);
        //     return $data;
        // } else {
        //     $error = curl_errno($ch);
        //     echo "call faild, errorCode:$error\n";
        //     curl_close($ch);
        //     return false;
        // }
    }

    /**
     * 获取客户端IP
     *
     */
    getClientIp() {
        $ip = '';
        // if ($_SERVER["HTTP_X_FORWARDED_FOR"]){
        //  $ip = $_SERVER["HTTP_X_FORWARDED_FOR"];
        // }elseif ($_SERVER["HTTP_CLIENT_IP"]){
        //  $ip = $_SERVER["HTTP_CLIENT_IP"];
        // }elseif ($_SERVER["REMOTE_ADDR"]){
        //  $ip = $_SERVER["REMOTE_ADDR"];
        // }elseif (getenv("HTTP_X_FORWARDED_FOR")){
        //  $ip = getenv("HTTP_X_FORWARDED_FOR");
        // }elseif (getenv("HTTP_CLIENT_IP")){
        //  $ip = getenv("HTTP_CLIENT_IP");
        // }elseif (getenv("REMOTE_ADDR")){
        //  $ip = getenv("REMOTE_ADDR");
        // }else{
        //  $ip = "127.0.0.1";
        // }

        //       if(strpos($ip, ',') !== FALSE){
        //           $ips = explode(',', $ip);
        //           return $ips[0];
        //       }

        return $ip;
    }


    encrypt($sData, $sSecretKey = '') {
        $sSecretKey = CARD_PASS_SECURE_KEY;
        $td = mcrypt_module_open(MCRYPT_RIJNDAEL_256, '', MCRYPT_MODE_CBC, '');
        $iv = mcrypt_create_iv(mcrypt_enc_get_iv_size($td), MCRYPT_RAND);
        mcrypt_generic_init($td, $sSecretKey, $iv);
        $encrypted = mcrypt_generic($td, $sData);
        mcrypt_generic_deinit($td);

        return $iv.$encrypted;
    }

    decrypt($sData, $sSecretKey = '') {
        $sSecretKey = CARD_PASS_SECURE_KEY;
        $td = mcrypt_module_open(MCRYPT_RIJNDAEL_256, '', MCRYPT_MODE_CBC, '');
        $iv = mb_substr($sData, 0, 32, 'latin1');
        mcrypt_generic_init($td, $sSecretKey, $iv);
        $data = mb_substr($sData, 32, mb_strlen($sData, 'latin1'), 'latin1');
        $data = mdecrypt_generic($td, $data);
        mcrypt_generic_deinit($td);
        mcrypt_module_close($td);

        return trim($data);
    }
}

module.exports = new WechatUtil();

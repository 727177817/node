const Cart = require('../models/cart.js');
const Address = require('../models/address.js');
const Order = require('../models/order.js');
const OrderGoods = require('../models/order_goods.js');
const Goods = require('../models/goods.js');
const WechatPay = require('../libs/payment/wechat/wechat_pay.js');

exports.getTest = async(ctx, next) => {

    ctx.body = get_random(5);
}

/**
 * 获取结算数据
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getCheckout = async(ctx, next) => {

    let { userId, suppliersId, communityId } = ctx.session;
    if (!userId) {
        ctx.throw(401);
        return;
    }

    if (!suppliersId) {
        ctx.throw(400, '缺少当前用户所在的小区信息');
        return;
    }

    // 收货地址
    let myAddress = await Address.getAllByUserIdAndCommunityId(userId, communityId);
    if (!myAddress) {
        myAddress = [];
    }

    // 购物车中的商品
    let cartGoods = await Cart.getAllByUserIdAndSuppliersId(userId, suppliersId);
    if (!cartGoods || cartGoods.length == 0) {
        ctx.throw(400, '购物车中没有商品');
        return;
    }
    let goodsIds = [];
    cartGoods.map(item => {
        goodsIds.push(item.goods_id);
    })
    let goods = await Goods.getListByIds(goodsIds);
    cartGoods.map(item => {
        goods.map(sitem => {
            if (item.goods_id == sitem.goods_id) {
                item.goods_thumb = sitem.goods_thumb;
            }
        })
    })

    //订单金额
    let total = order_fee({}, cartGoods, {});

    //TODO 获取优惠券列表

    ctx.body = {
        consignees: myAddress,
        goods: cartGoods,
        total: total,
        coupons: [],
        timestamp: new Date().getTime() //系统当前时间
    }
}

/**
 * 提交订单
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getOrder = async(ctx, next) => {

    let { userId, suppliersId } = ctx.session;
    if (!userId) {
        ctx.throw(401);
        return;
    }

    if (!suppliersId) {
        ctx.throw(400, '缺少当前用户所在的小区信息');
        return;
    }

    let { consigneeId, couponId, shippingType, shippingTime } = ctx.request.body;
    //收货地址ID
    if (!consigneeId) {
        ctx.throw(400, '收货地址未选择');
        return;
    }

    // 配送时间
    if (!shippingType || !shippingTime) {
        ctx.throw(400, '配送时间未选择');
        return;
    }

    //TODO 校验配送时间的合理性

    let result = await order(userId, suppliersId, consigneeId, couponId, shippingType, shippingTime);

    ctx.body = result;
}

/**
 * 发起支付，获取支付相关参数
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.postPay = async(ctx, next) => {

    let { orderId } = ctx.request.body;

    let param = {
    	price: 30,
        orderId: '',
        billId: '',
        openid: ''
    };

    let wechatPay = new WechatPay();
    let res = wechatPay.dopay(param);

    if (!res.code){
    	//生成支付单失败，在重试一次
    }

    ctx.body = res;
}


async function order(userId, suppliersId, consigneeId, couponId, shippingType, shippingTime) {

    // /* 取得购物类型 */
    //    $flow_type = isset($_SESSION['flow_type']) ? intval($_SESSION['flow_type']) : CART_GENERAL_GOODS;

    $flow_type = 0;

    let cartGoods = await Cart.getAllByUserIdAndSuppliersId(userId, suppliersId);
    if (!cartGoods || cartGoods.length == 0) {
        return '购物车中没有商品';
    }

    //    /* 检查商品库存 */
    //    /* 如果使用库存，且下订单时减库存，则减少库存 */
    //    if ($_CFG['use_storage'] == '1' && $_CFG['stock_dec_time'] == SDT_PLACE)
    //    {
    //        $cart_goods_stock = get_cart_goods();
    //        $_cart_goods_stock = array();
    //        foreach ($cart_goods_stock['goods_list'] as $value)
    //        {
    //            $_cart_goods_stock[$value['rec_id']] = $value['goods_number'];
    //        }
    //        flow_cart_stock($_cart_goods_stock);
    //        unset($cart_goods_stock, $_cart_goods_stock);
    //    }

    $consignee = Address.getOneWithUserId(userId, consigneeId);

    if (!$consignee) {
        return '收货地址不存在';
    }

    $order = {
        'shipping_id': 1,
        'pay_id': 1,
        'pack_id': 0,
        'card_id': 0,
        'card_message': '',
        'bonus_id': 0,
        'inv_type': '',
        'inv_payee': '',
        'inv_content': '',
        'postscript': '',
        'how_oos': '',
        'user_id': userId,
        'add_time': Math.round(new Date().getTime() / 1000),
        'order_status': 0,
        'shipping_status': 0,
        'pay_status': 0,
        'agency_id': 0,
        'extension_code': '',
        'extension_id': 0,
        'surplus': 0,
        'integral': 0,
        'shipping_type': shippingType, //当天的09-14和15-21，分别对应1、2
        'shipping_time': shippingTime,
    };


    //    /* 检查红包是否存在 */
    //    if ($order['bonus_id'] > 0)
    //    {
    //        $bonus = bonus_info($order['bonus_id']);

    //        if (empty($bonus) || $bonus['user_id'] != $user_id || $bonus['order_id'] > 0 || $bonus['min_goods_amount'] > cart_amount(true, $flow_type))
    //        {
    //            $order['bonus_id'] = 0;
    //        }
    //    }
    //    elseif (isset($_POST['bonus_sn']))
    //    {
    //        $bonus_sn = trim($_POST['bonus_sn']);
    //        $bonus = bonus_info(0, $bonus_sn);
    //        $now = gmtime();
    //        if (empty($bonus) || $bonus['user_id'] > 0 || $bonus['order_id'] > 0 || $bonus['min_goods_amount'] > cart_amount(true, $flow_type) || $now > $bonus['use_end_date'])
    //        {
    //        }
    //        else
    //        {
    //            if ($user_id > 0)
    //            {
    //                $sql = "UPDATE " . $ecs->table('user_bonus') . " SET user_id = '$user_id' WHERE bonus_id = '$bonus[bonus_id]' LIMIT 1";
    //                $db->query($sql);
    //            }
    //            $order['bonus_id'] = $bonus['bonus_id'];
    //            $order['bonus_sn'] = $bonus_sn;
    //        }
    //    }

    $result = await create_order($order, cartGoods, $consignee, $flow_type, false);

    $new_order_id = $result['new_order_id'];

    // 清空购物车 
    await Cart.clear(userId, suppliersId);

    return 'success';
}

/**
 * 创建订单
 */
async function create_order($order, $cart_goods, $consignee, $flow_type, $plan = false) {

    /* 收货人信息 */
    for (var $key in $consignee) {
        $order[$key] = $consignee[$key];
    }
    // $order['detail_address'] = $consignee['address'];

    /* 订单中的总额 */
    $total = order_fee($order, $cart_goods, $consignee);
    $order['bonus'] = $total['bonus'];
    if ($plan) {
        $order['goods_amount'] = 0;
    } else {
        $order['goods_amount'] = $total['goods_price'];
    }
    $order['discount'] = $total['discount'];
    $order['surplus'] = $total['surplus'];
    $order['tax'] = $total['tax'];

    // // 购物车中的商品能享受红包支付的总额
    // $discount_amout = compute_discount_amount();
    // // 红包和积分最多能支付的金额为商品总额
    // $temp_amout = $order['goods_amount'] - $discount_amout;
    // if ($temp_amout <= 0) {
    //     $order['bonus_id'] = 0;
    // }

    /* 配送方式 */
    // if ($order['shipping_id'] > 0) {
    //     $shipping = shipping_info($order['shipping_id']);
    //     $order['shipping_name'] = addslashes($shipping['shipping_name']);
    // }

    if ($plan) {
        $order['shipping_fee'] = 0;
    } else {
        $order['shipping_fee'] = $total['shipping_fee'];
    }

    $order['insure_fee'] = $total['shipping_insure'];

    /* 支付方式 */
    // if ($order['pay_id'] > 0) {
    //     $payment = payment_info($order['pay_id']);
    //     $order['pay_name'] = addslashes($payment['pay_name']);
    // }
    $order['pay_fee'] = $total['pay_fee'];

    // $order['order_amount'] = number_format($total['amount'], 2, '.', '');

    $send = false;

    /* 如果订单金额为0（使用余额或积分或红包支付），修改订单状态为已确认、已付款 */
    /* if ($order['order_amount'] <= 0) */
    // if ($order['order_amount'] <= 0 && $cart_goods[0]['goods_price'] != 0) {
    //     $order['order_status'] = OS_CONFIRMED;
    //     $order['confirm_time'] = gmtime();
    //     $order['pay_status'] = PS_PAYED;
    //     $order['pay_time'] = gmtime();
    //     $order['order_amount'] = 0;
    // }

    $order['integral_money'] = $total['integral_money'];
    $order['integral'] = $total['integral'];

    if ($order['extension_code'] == 'exchange_goods') {
        $order['integral_money'] = 0;
        $order['integral'] = $total['exchange_integral'];
    }

    $order['from_ad'] = '0';
    $order['referer'] = '';

    //分成功能关闭
    $order['parent_id'] = 0;

    /* 插入订单表 */
    $order['order_sn'] = get_order_sn(); //获取新订单号
    let ret = await Order.insert($order); // 返回值[34]
    if (ret && ret.length > 0) {
        $order['order_id'] = ret[0];
    }

    let goods = [];
    $cart_goods.map((item, i) => {
        goods.push({
            order_id: $order.order_id,
            goods_id: item.goods_id,
            goods_name: item.goods_name,
            goods_sn: item.goods_sn,
            product_id: item.product_id,
            goods_number: item.goods_number,
            market_price: item.market_price,
            goods_price: item.goods_price,
            goods_attr: item.goods_attr,
            is_real: item.is_real,
            extension_code: item.extension_code,
            parent_id: item.parent_id,
            is_gift: item.is_gift,
            goods_attr_id: item.goods_attr_id
        });
    });
    let ret0 = await OrderGoods.insert(goods);

    // /* 处理红包 */
    // if ($order['bonus_id'] > 0 && $temp_amout > 0) {
    //     use_bonus($order['bonus_id'], $new_order_id);
    // }

    // /* 如果使用库存，且下订单时减库存，则减少库存 */
    // if ($_CFG['use_storage'] == '1' && $_CFG['stock_dec_time'] == SDT_PLACE) {
    //     change_order_goods_storage($order['order_id'], true, SDT_PLACE);
    // }
    return {
        'order': $order,
        'consignee': $consignee,
        'send': $send,
        'new_order_id': $order['order_id'],
        'total': $total
    };
}


/**
 * 获得订单中的费用信息
 *
 * @access  public
 * @param   array   $order
 * @param   array   $goods
 * @param   array   $consignee
 * @return  array
 */
function order_fee($order, $goods, $consignee) {

    $total = {
        'real_goods_count': 0,
        'gift_amount': 0,
        'goods_price': 0,
        'market_price': 0,
        'discount': 0,
        'pack_fee': 0,
        'card_fee': 0,
        'shipping_fee': 0,
        'shipping_insure': 0,
        'integral_money': 0,
        'bonus': 0,
        'surplus': 0,
        'cod_fee': 0,
        'pay_fee': 0,
        'tax': 0
    };
    $weight = 0;

    /* 商品总价 */
    for (var $key in $goods) {
        /* 统计实体商品的个数 */
        if ($goods[$key]['is_real']) {
            $total['real_goods_count']++;
        }

        $total['goods_price'] += $goods[$key]['goods_price'] * $goods[$key]['goods_number'];
        $total['market_price'] += $goods[$key]['market_price'] * $goods[$key]['goods_number'];
    }

    $total['saving'] = $total['market_price'] - $total['goods_price'];
    $total['save_rate'] = $total['market_price'] ? Math.round($total['saving'] * 100 / $total['market_price']) +
        '%' : 0;

    // /* 红包 */

    // if (!empty($order['bonus_id']))
    // {
    //     $bonus          = bonus_info($order['bonus_id']);
    //     $total['bonus'] = $bonus['type_money'];
    // }

    // /* 线下红包 */
    //  if (!empty($order['bonus_kill']))
    // {
    //     $bonus          = bonus_info(0,$order['bonus_kill']);
    //     $total['bonus_kill'] = $order['bonus_kill'];
    //     $total['bonus_kill_formated'] = price_format($total['bonus_kill'], false);
    // }

    /* 配送费用 */
    $shipping_cod_fee = null;

    if ($order['shipping_id'] > 0 && $total['real_goods_count'] > 0) {
        $region['country'] = $consignee['country'];
        $region['province'] = $consignee['province'];
        $region['city'] = $consignee['city'];
        $region['district'] = $consignee['district'];
        //$shipping_info = shipping_area_info($order['shipping_id'], $region);

        //if (!empty($shipping_info)) {
        $weight_price = cart_weight_price();

        $total['shipping_fee'] = shipping_fee($shipping_info['shipping_code'], $shipping_info['configure'], $weight_price['weight'], $total['goods_price'], $weight_price['number']);

        //}
    }

    // 购物车中的商品能享受红包支付的总额
    // $bonus_amount = compute_discount_amount();
    // 红包和积分最多能支付的金额为商品总额
    // $max_amount = $total['goods_price'] == 0 ? $total['goods_price'] : $total['goods_price'] - $bonus_amount;

    /* 计算订单总额 */
    $total['amount'] = $total['goods_price'] - $total['discount'] + $total['tax'] + $total['pack_fee'] + $total['card_fee'] +
        $total['shipping_fee'] + $total['shipping_insure'] + $total['cod_fee'];

    // 减去红包金额
    // $use_bonus        = min($total['bonus'], $max_amount); // 实际减去的红包金额
    // if(isset($total['bonus_kill']))
    // {
    //     $use_bonus_kill   = min($total['bonus_kill'], $max_amount);
    //     $total['amount'] -=  $price = number_format($total['bonus_kill'], 2, '.', ''); // 还需要支付的订单金额
    // }

    // $total['bonus']   = $use_bonus;

    // $total['amount'] -= $use_bonus; // 还需要支付的订单金额
    // $max_amount      -= $use_bonus; // 积分最多还能支付的金额

    return $total;
}

/**
 * 得到新订单号，时间戳+5位随机数
 * @return  string
 */
function get_order_sn() {
    return new Date().getTime() + get_random(5);
}

function get_random(max) {
    let r = Math.round(Math.random() * (Math.pow(10, max) - 1));
    let padStr = '';
    let limit = 0;

    r = r.toString();
    limit = r.length;

    while (limit < max) {
        padStr += '0';
        limit++;
    }

    return padStr + r;
}

/**
 * 获得购物车中商品的总重量、总价格、总数量
 *
 * @access  public
 * @param   int     $type   类型：默认普通商品
 * @return  array
 */
function cart_weight_price($type = CART_GENERAL_GOODS) {
    let $package_row = {
        'weight': 0,
        'amount': 0,
        'number': 0
    };

    $packages_row['free_shipping'] = 1;

    // $sql    = 'SELECT SUM(g.goods_weight * c.goods_number) AS weight, ' .
    //                 'SUM(c.goods_price * c.goods_number) AS amount, ' .
    //                 'SUM(c.goods_number) AS number '.
    //             'FROM ' . $GLOBALS['ecs']->table('cart') . ' AS c '.
    //             'LEFT JOIN ' . $GLOBALS['ecs']->table('goods') . ' AS g ON g.goods_id = c.goods_id '.
    //             "WHERE c.session_id = '" . SESS_ID . "' " .
    //             "AND rec_type = '$type' AND g.is_shipping = 0 AND c.extension_code != 'package_buy'";
    // $row = $GLOBALS['db']->getRow($sql);

    // $packages_row['weight'] = floatval($row['weight']) + $package_row['weight'];
    // $packages_row['amount'] = floatval($row['amount']) + $package_row['amount'];
    // $packages_row['number'] = intval($row['number']) + $package_row['number'];

    return $packages_row;
}

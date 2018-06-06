const Cart = require('../models/cart.js');
const Address = require('../models/address.js');
const Order = require('../models/order.js');
const OrderGoods = require('../models/order_goods.js');
const Goods = require('../models/goods.js');
const WechatPay = require('../libs/payment/wechat/wechat_pay.js');
const Coupon = require('../models/coupon.js');
const Community = require('../models/community.js');
const BaseController = require('./basecontroller.js');
const User = require('../models/user.js');
const PayLog = require('../models/pay_log.js');
const config = require('../config');
const moment = require('moment');

/**
 * 结算相关接口
 */
class CommitController extends BaseController {
    constructor() {
        super();
    }

    async getTest(ctx, next) {

        ctx.body = this.getShippingDuration();
    }

    async postTest(ctx, next) {

        ctx.body = ctx.request.body;
    }

    /**
     * 获取结算数据
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    async getCheckout(ctx, next) {
        if (!this.checkUserIntegrity(ctx)) {
            return;
        }

        let userId = ctx.user.userId,
            warehouseId = ctx.user.warehouseId,
            communityId = ctx.user.communityId,
            couponId = ctx.query.couponId,
            couponSn = ctx.query.couponSn;

        // 收货地址，可选择当前所选小区对应仓库的所有地址
        let communityIds = [];
        let communities = await Community.getListByWarehouseId(warehouseId);

        if (communities) {
            communities.map(item => {
                communityIds.push(item.community_id);
            })
        }

        let myAddress = await Address.getAllByUserIdAndCommunityIds(userId, communityIds);
        if (!myAddress) {
            myAddress = [];
        }

        // 购物车中的商品
        let cartGoods = await Cart.getAllByUserIdAndWarehouseId(userId, warehouseId);
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
                    item.goods_img = sitem.goods_img;
                }
            })
        })

        let $bonus = {};
        // 如果使用了优惠券
        if (couponId || couponSn) {

            //计算购物车中的商品总价
            let cartAmount = this.getCartAmount(cartGoods);

            /* 检查红包是否存在 */
            if (couponId) {
                $bonus = await Coupon.getOne(couponId);

                if (!$bonus || $bonus['user_id'] != userId || $bonus['order_id'] > 0 || $bonus['min_goods_amount'] > cartAmount) {
                    ctx.throw(400, '使用红包错误');
                    return;
                }
            } else if (couponSn) {
                couponSn = trim(couponSn);
                $bonus = await Coupon.getOneByBonusSn(couponSn);
                $now = this.getTimestamp();

                if (!$bonus || $bonus['user_id'] > 0 || $bonus['order_id'] > 0 ||
                    $bonus['min_goods_amount'] > cartAmount ||
                    $now > $bonus['use_end_date']) {
                    ctx.throw(400, '使用红包错误');
                    return;
                }
            }
        }

        //订单金额，默认配送方式
        let total = this.order_fee({
            'shipping_id': 1,
            'bonus_id': $bonus.bonus_id
        }, cartGoods, null, $bonus);

        //获取优惠券列表
        let coupons = await Coupon.getAvaliableCoupons(userId, total.goods_price, this.getTimestamp());

        ctx.body = {
            consignees: myAddress,
            goods: cartGoods,
            total: total,
            coupons: coupons,
            durations: this.getShippingDuration(),
            timestamp: this.getTimestamp() //系统当前时间
        }
    }

    /**
     * 提交订单
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    async postOrder(ctx, next) {

        if (!this.checkUserIntegrity(ctx)) {
            return;
        }

        let warehouseId = ctx.user.warehouseId
        let userId = ctx.user.userId;

        let { consigneeId, couponId, couponSn, shippingType, shippingTime, postscript } = ctx.request.body;
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
        let shippingDate = this.getShippingTime(shippingTime, shippingType);
        if (isNaN(shippingDate)) {
            ctx.throw(400, shippingDate);
            return;
        }

        let result = await this.order(userId, warehouseId, consigneeId, couponId, couponSn, shippingType, shippingDate, postscript);

        ctx.body = result;
    }

    /**
     * 发起支付，获取支付相关参数
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    async postPay(ctx, next) {

        let { orderId } = ctx.request.body;

        if (!orderId) {
            ctx.throw(400, '缺少参数orderId');
            return;
        }

        let userInfo = await User.getUserInfo(ctx.user.userId);
        if (!userInfo) {

        }

        let orderInfo = await Order.getOne(orderId);
        // 只有已确认、未支付的订单可以发起支付
        if (orderInfo.order_status != config.OS_CONFIRMED || orderInfo.pay_status != config.PS_UNPAYED) {
            ctx.throw(400, '该订单已支付或已取消');
            return;
        }

        //插入支付记录
        let payLogId = await PayLog.insert({
            order_id: orderInfo.order_id,
            order_amount: orderInfo.order_amount,
            order_type: 0,
            is_paid: 0
        });

        let goods = await OrderGoods.getOrderGoods(orderInfo.order_id);
        let body;
        if (goods && goods.length > 0) {
            body = goods[0].goods_name + '等';
        }
        let param = {
            price: orderInfo.order_amount,
            orderId: orderInfo.order_id,
            billno: payLogId,
            openid: userInfo.open_id,
            body: body
        };

        let wechatPay = new WechatPay();
        let res = await wechatPay.dopay(param);

        if (!res.code) {
            //生成支付单失败，在重试一次
        }

        ctx.body = res;
    }

    async order(userId, warehouseId, consigneeId, couponId, couponSn, shippingType, shippingTime, postscript) {

        let cartGoods = await Cart.getAllByUserIdAndWarehouseId(userId, warehouseId);
        if (!cartGoods || cartGoods.length == 0) {
            return '购物车中没有商品';
        }

        /* 检查商品库存 */
        let e = await this.flow_cart_stock(cartGoods);
        if (e.length > 0) {
            return e.join(',') + '库存不足';
        }

        let $consignee = await Address.getOneWithUserId(userId, consigneeId);

        if (!$consignee) {
            return '收货地址不存在';
        }

        let $order = {
            'shipping_id': 1,
            'pay_id': 1,
            'pack_id': 0,
            'card_id': 0,
            'card_message': '',
            'bonus_id': couponId,
            'inv_type': '',
            'inv_payee': '',
            'inv_content': '',
            'postscript': postscript,
            'how_oos': '',
            'user_id': userId,
            'add_time': this.getTimestamp(),
            'order_status': config.OS_CONFIRMED,
            'shipping_status': config.SS_UNSHIPPED,
            'pay_status': config.PS_UNPAYED,
            'agency_id': 0,
            'extension_code': '',
            'extension_id': 0,
            'surplus': 0,
            'integral': 0,
            'shipping_type': shippingType, //标明是今天配送还是第二天配送，分别对应1、2
            'shipping_time': 0,
            'best_time': shippingTime
        };

        //计算购物车中的商品总价
        let cartAmount = this.getCartAmount(cartGoods);

        /* 检查红包是否存在 */
        let $bonus;
        if ($order['bonus_id'] > 0) {
            $bonus = await Coupon.getOne($order['bonus_id']);

            if (!$bonus || $bonus['user_id'] != userId || $bonus['order_id'] > 0 || $bonus['min_goods_amount'] > cartAmount) {
                $order['bonus_id'] = 0;
            }
        } else if (couponSn) {
            couponSn = trim(couponSn);
            $bonus = await Coupon.getOneByBonusSn(couponSn);
            $now = this.getTimestamp();

            if (!$bonus || $bonus['user_id'] > 0 || $bonus['order_id'] > 0 ||
                $bonus['min_goods_amount'] > cartAmount ||
                $now > $bonus['use_end_date']) {

            } else {
                if (userId > 0) {
                    Coupon.update($bonus['bonus_id'], {
                        user_id: userId
                    });
                }
                $order['bonus_id'] = $bonus['bonus_id'];
                $order['bonus_sn'] = couponSn;
            }
        }

        let $result = await this.create_order($order, cartGoods, $consignee, $bonus);

        let $new_order_id = $result['new_order_id'];

        // 清空购物车 
        await Cart.clear(userId, warehouseId);

        //设置默认地址
        this.setDefaultConsignee(userId, consigneeId);

        // 返回订单号
        return $result.order.order_sn;
    }

    /**
     * 创建订单
     */
    async create_order($order, $cart_goods, $consignee, $bonus) {

        /* 收货人信息 */
        $order['consignee'] = $consignee['consignee'];
        $order['mobile'] = $consignee['mobile'];
        $order['address'] = $consignee['address'];

        //处理小区信息，存储小区名称地址到订单信息
        let community = await Community.getOne($consignee['community_id']);
        $order['community_name'] = community['community_name'];
        $order['community_city'] = community['community_city'];
        $order['community_address'] = community['community_address'];

        /* 订单中的总额 */
        let $total = this.order_fee($order, $cart_goods, $consignee, $bonus);
        $order['bonus'] = $total['bonus'];
        $order['goods_amount'] = $total['goods_price'];
        $order['discount'] = $total['discount'];
        $order['surplus'] = $total['surplus'];
        $order['tax'] = $total['tax'];

        /* 配送方式 */
        if ($order['shipping_id'] > 0) {
            //     $shipping = shipping_info($order['shipping_id']);
            $order['shipping_name'] = '自营配送';
        }

        $order['shipping_fee'] = $total['shipping_fee'];

        $order['insure_fee'] = $total['shipping_insure'];

        /* 支付方式 */
        if ($order['pay_id'] > 0) {
            //     $payment = payment_info($order['pay_id']);
            $order['pay_name'] = '微信支付';
        }
        $order['pay_fee'] = $total['pay_fee'];

        $order['order_amount'] = this.number_format($total['amount'], 2, '.', '');

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

        // 约定订单来源小程序下单
        $order['from_ad'] = '0';
        $order['referer'] = '微信小程序';

        //分成功能关闭
        $order['parent_id'] = 0;

        /* 插入订单表 */
        $order['order_sn'] = this.get_order_sn(); //获取新订单号
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
                goods_attr_id: item.goods_attr_id,
                goods_weight: item.goods_weight,
                goods_thumb: item.goods_thumb,
                goods_img: item.goods_img
            });
        });
        let ret0 = await OrderGoods.insert(goods);


        /* 处理红包 */
        if ($order['bonus_id'] > 0) {
            this.use_bonus($order['bonus_id'], $order['order_id']);
        }

        /* 下订单时减库存 */
        this.change_order_goods_storage(goods, true);

        return {
            'order': $order,
            'consignee': $consignee,
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
    order_fee($order, $goods, $consignee, $bonus) {

        let $total = {
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
        let $weight = 0;

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

        /* 红包 */
        if ($order['bonus_id'] && $bonus) {
            $total['bonus'] = $bonus['type_money'];
        }

        /* 配送费用 */
        if ($order['shipping_id'] > 0 && $total['real_goods_count'] > 0) {
            $total['shipping_fee'] = config.AS_SHIPPING_FEE;
        }

        // 购物车中的商品能享受红包支付的总额
        // $bonus_amount = compute_discount_amount();
        let $bonus_amount = 0;
        // 红包和积分最多能支付的金额为商品总额
        let $max_amount = $total['goods_price'] == 0 ? $total['goods_price'] : $total['goods_price'] - $bonus_amount;

        /* 计算订单总额 */
        $total['amount'] = $total['goods_price'] - $total['discount'] + $total['tax'] + $total['pack_fee'] + $total['card_fee'] +
            $total['shipping_fee'] + $total['shipping_insure'] + $total['cod_fee'];

        // 减去红包金额
        let $use_bonus = Math.min($total['bonus'], $max_amount); // 实际减去的红包金额
        // if(isset($total['bonus_kill']))
        // {
        //     $use_bonus_kill   = min($total['bonus_kill'], $max_amount);
        //     $total['amount'] -=  $price = this.number_format($total['bonus_kill'], 2, '.', ''); // 还需要支付的订单金额
        // }

        $total['bonus'] = $use_bonus;

        $total['amount'] -= $use_bonus; // 还需要支付的订单金额
        // $max_amount      -= $use_bonus; // 积分最多还能支付的金额
        
        // 格式化
        $total['amount'] = this.number_format($total['amount']);
        $total['goods_price'] = this.number_format($total['goods_price']);
        $total['market_price'] = this.number_format($total['market_price']);
        $total['saving'] = this.number_format($total['saving']);

        return $total;
    }

    /**
     * 得到新订单号，时间戳+5位随机数
     * @return  string
     */
    get_order_sn() {
        return this.getTimestamp() + this.get_random(5);
    }

    get_random(max) {
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
     * 取得购物车总金额
     * @param {array} 购物车商品
     * @return  float   购物车总金额
     */
    getCartAmount(cartGoods) {
        let amount = 0;
        cartGoods.map((item) => {
            amount += item.goods_price * item.goods_number;
        });

        return amount;
    }

    /**
     * 获取可选的配送时间段
     * 1. 没半小时为已配送区间
     * 2. 18点后可选择今天和第二天配送
     * 3. 18点前只能选择今天配送
     * 4. 配送时间只能选9-21点
     * @return {[type]} [description]
     */
    getShippingDuration() {

        let result = [];
        // let date = new Date('2018-06-05 21:22:00');
        let date = new Date();
        let hour = date.getHours();
        let minute = date.getMinutes();

        if (hour < 22) {
            if (hour < 9) {
                date.setHours(9, 0, 0, 0);
            } else {
                if (minute < 30) {
                    // date.setMinutes(0, 0, 0);
                    date.setMinutes(30, 0, 0);
                } else {
                    date.setHours(hour + 1, 0, 0, 0);
                }
            }

            let arr = this.generateDuration(date);
            if(arr.length > 0){
                arr[0].label = '立即配送（' + arr[0].label + '）';
            }
            result.push({
                label: '今天',
                shippintType: 1,
                durations: arr
            });
        }

        if (hour >= 18) {
            date.setDate(date.getDate() + 1);
            date.setHours(9, 0, 0, 0);
            result.push({
                label: '第二天',
                shippintType: 2,
                durations: this.generateDuration(date)
            });
        }

        return result;
    }

    /**
     * 从某个时间开始到该时间21结束，生成时间段
     * @param  {[type]} start [description]
     * @return {[type]}       [description]
     */
    generateDuration(start) {
        let ret = [];
        while (start.getHours() <= 22) {
            ret.push(this.padZero(start.getHours()) + ':' + this.padZero(start.getMinutes()));
            start.setMinutes(start.getMinutes() + 30);
        }

        let result = [];
        for (let i = 0, len = ret.length - 2; i < len; i++) {
            result.push({
                value: ret[i],
                label: ret[i] + '-' + ret[i + 1]
            });
        }

        return result;
    }

    padZero(num) {
        return num < 10 ? '0' + num : num;
    }

    /**
     * 校验配送时间的合理
     * 1. 配送时间为当天为09-14和15-21
     * 2. 配送时间需晚1小时
     * @return {[type]} [description]
     */
    getShippingTime(shippingTime, shippingType) {
        if (shippingType != '1' && shippingType != '2') {
            return '配送时间类型选择不正确';
        }
        if (!/^\d+:\d+$/.test(shippingTime)) {
            return '配送时间格式不正确';
        }

        let date = new Date();
        let hour = date.getHours();
        let shippingHour = parseInt(shippingTime.split(':')[0]);
        let shippingMinute = parseInt(shippingTime.split(':')[1]);

        if (hour < 18) {
            //18点前只能选择当天配送
            if (shippingType != 1) {
                return '18点前只能选择当天配送';
            }
        } else if (hour >= 22) {
            // 22点后只能选择第二天配送
            if (shippingType != 2) {
                return '22点后只能选择第二天配送';
            }
        }

        if (shippingType == 1) {
            //当天配送只能选择当前时间到22点之间的
            if (shippingHour <= hour && shippingHour >= 22) {
                return '非法配送时间，应当选择' + hour + '-22点';
            }
        } else if (shippingType == 2) {
            // 第二天配送只能选择9-22点之间的
            if (shippingHour < 9 || shippingHour >= 22) {
                return '非法配送时间，应当选择09-22点';
            }
        }

        // if (hour >= 22 && hour < 24) {
        //     date.setDate(date.getDate() + 1);
        // }
        if (shippingType == 2) {
            date.setDate(date.getDate() + 1);
        }
        date.setHours(shippingHour);
        date.setMinutes(shippingMinute);
        date.setSeconds(0);
        date.setMilliseconds(0);

        // 转换成utc时间戳
        return Date.parse(date) / 1000 - 8 * 3600;
    }

    /**
     * 设置默认收货地址，该用户其余的地址取消默认
     */
    async setDefaultConsignee(userId, consigneeId) {
        Address.resetDefaultByUser(userId);
        Address.update(consigneeId, { default: 1 });
    }

    number_format(num) {
        return Math.round(num * 100) / 100;
    }

    /**
     * 设置红包为已使用
     * @param   int     bonusId   红包id
     * @param   int     orderId   订单id
     * @return  bool
     */
    async use_bonus(bonusId, orderId) {
        let usedTime = this.getTimestamp();

        return await Coupon.setUsed(bonusId, orderId, usedTime);
    }

    /**
     * 改变订单中商品库存
     * @param   int     goods   订单商品
     * @param   bool    $is_dec     是否减少库存
     */
    change_order_goods_storage(goods, $is_dec = true) {
        goods.map((item) => {
            if ($is_dec) {
                this.change_goods_storage(item['goods_id'], -item['goods_number']);
            } else {
                this.change_goods_storage(item['goods_id'], item['goods_number']);
            }
        })
    }

    /**
     * 商品库存增与减
     *
     * @param   int    goodsId         商品ID
     * @param   int    number          增减数量，默认0；
     * @return  bool               true，成功；false，失败；
     */
    async change_goods_storage(goodsId, number = 0) {
        if (number == 0) {
            return true; // 值为0即不做、增减操作，返回true
        }

        if (!goodsId) {
            return false;
        }

        /* 处理商品库存 */
        let res = await Goods.changeQuantity(goodsId, number);

        return res > 0;
    }

    /**
     * 检查订单中商品库存
     *
     * @access  public
     * @param   array   cartGoods 购物车商品
     *
     * @return  void
     */
    async flow_cart_stock(cartGoods) {
        let goodsIds = [];
        cartGoods.map((goods) => {
            goodsIds.push(goods.goods_id);
        });
        let realGoods = await Goods.getListByIds(goodsIds);

        let errors = [];
        cartGoods.map((goods) => {
            realGoods.map((g) => {
                if (goods.goods_id == g.goods_id) {
                    if (goods.goods_number > g.goods_number) {
                        errors.push(g.goods_name);
                    }
                    return;
                }
            })
        })

        return errors;
    }
}

module.exports = new CommitController();

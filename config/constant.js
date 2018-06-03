const CONSTANT = {};

function add(k, v){
	CONSTANT[k] = v;
}

add('CERT_ROOT', '');

/* 购物车商品类型 */
add('CART_GENERAL_GOODS',        0); // 普通商品
add('CART_GROUP_BUY_GOODS',      1); // 团购商品
add('CART_AUCTION_GOODS',        2); // 拍卖商品
add('CART_SNATCH_GOODS',         3); // 夺宝奇兵
add('CART_EXCHANGE_GOODS',       4); // 积分商城

/* 订单状态 */
add('OS_UNCONFIRMED',            0); // 未确认
add('OS_CONFIRMED',              1); // 已确认
add('OS_CANCELED',               2); // 已取消
add('OS_INVALID',                3); // 无效
add('OS_RETURNED',               4); // 退货
add('OS_SPLITED',                5); // 已分单
add('OS_SPLITING_PART',          6); // 部分分单

/* 支付类型 */
add('PAY_ORDER',                 0); // 订单支付
add('PAY_SURPLUS',               1); // 会员预付款

/* 配送状态 */
add('SS_UNSHIPPED',              0); // 未发货
add('SS_SHIPPED',                1); // 已发货
add('SS_RECEIVED',               2); // 已收货
add('SS_PREPARING',              3); // 备货中
add('SS_SHIPPED_PART',           4); // 已发货(部分商品)
add('SS_SHIPPED_ING',            5); // 发货中(处理分单)
add('OS_SHIPPED_PART',           6); // 已发货(部分商品)

/* 支付状态 */
add('PS_UNPAYED',                0); // 未付款
add('PS_PAYING',                 1); // 付款中
add('PS_PAYED',                  2); // 已付款

add('WX_ORDER_API', 'https://api.mch.weixin.qq.com/pay/unifiedorder');
add('WX_QUERY_API', 'https://api.mch.weixin.qq.com/pay/orderquery');
add('WX_CLOSE_API', 'https://api.mch.weixin.qq.com/pay/closeorder');
add('WX_REFUND_API', 'https://api.mch.weixin.qq.com/secapi/pay/refund');
add('WX_REFUND_QUERY_API', 'https://api.mch.weixin.qq.com/pay/refundquery');
add('WX_DOWNLOAD_BILL_API', 'https://api.mch.weixin.qq.com/pay/downloadbill');
add('WX_SIGNKEY_API', 'https://api.mch.weixin.qq.com/sandboxnew/pay/getsignkey');
add('WX_AUTH_API', 'https://open.weixin.qq.com/connect/oauth2/authorize');

/* 默认配送费用 */
add('AS_SHIPPING_FEE', 3);

/* 首页广告位ID */
add('HOME_AD_POSITION', 2);

/* 首页公告类型ID */
add('HOME_NOTICE_TYPE_ID', 14);

module.exports = CONSTANT;
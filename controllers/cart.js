const Goods = require('../models/goods.js');
const Cart = require('../models/cart.js');

/**
 * 添加购物车
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.add = async(ctx, next) => {
    let query = ctx.request.query;
    if (!query.goods_id) {
        ctx.throw(400, '缺少参数goods_id');
        return;
    }

    let result = addToCart(query.goods_id, 1);
    if (result === 'success') {
        ctx.body = '加入购物车成功';
    } else {
        ctx.throw(400, result);
    }
}


exports.postRemove = async(ctx, next) => {
    let body = ctx.request.body;

    let goods = await Goods.getDetail(body.goods_id);
    ctx.body = goods[0];
}


exports.change = async(ctx, next) => {
    try {
        let goods = await Goods.getDetail(ctx.query.goods_id);
        ctx.body = goods[0];
    } catch (err) {
        return 'err';
    }
}


/**
 * 添加商品到购物车
 *
 * @access  public
 * @param   integer goods_id   商品编号
 * @param   integer num        商品数量
 * @param   integer user_id    用户ID
 * @return  boolean
 */
async function addToCart(goods_id, num = 1, user_id) {

    // /* 取得商品信息 */
    // $sql = "SELECT g.goods_name, g.goods_sn, g.is_on_sale, g.is_real, ".
    //             "g.market_price, g.shop_price AS org_price, g.promote_price, g.promote_start_date, ".
    //             "g.promote_end_date, g.goods_weight, g.integral, g.extension_code, ".
    //             "g.goods_number, g.is_alone_sale, g.is_shipping,".
    //             "IFNULL(mp.user_price, g.shop_price * '$_SESSION[discount]') AS shop_price ".
    //         " FROM " .$GLOBALS['ecs']->table('goods'). " AS g ".
    //         " WHERE g.goods_id = '$goods_id'" .
    //         " AND g.is_delete = 0";
    // $goods = $GLOBALS['db']->getRow($sql);
    let goods = await Goods.getDetail(goods_id);

    if (!goods) {
        return '商品不存在';
    }

    /* 是否正在销售 */
    if (goods['is_on_sale'] == 0) {
        return '商品还未上架';
    }

    /* 不是配件时检查是否允许单独销售 */
    if (goods['is_alone_sale'] == 0) {
        return '该商品不支持单独销售';
    }

    /* 检查：库存 */
    //检查：商品购买数量是否大于总库存
    if (num > goods['goods_number']) {
        return '购买数量超出库存';
    }

    // /* 计算商品的促销价格 */
    // $spec_price             = spec_price($spec);
    // $goods_price            = get_final_price($goods_id, $num, true, $spec);
    // $goods['market_price'] += $spec_price;
    // $goods_attr             = get_goods_attr_info($spec);
    // $goods_attr_id          = join(',', $spec);

    /* 初始化要插入购物车的基本件数据 */
    $parent = {
        'user_id': user_id,
        'session_id': '',
        'goods_id': goods_id,
        'goods_sn': goods['goods_sn'],
        'product_id': '',
        'goods_name': goods['goods_name'],
        'market_price': goods['market_price'],
        'goods_attr': '',
        'goods_attr_id': '',
        'is_real': goods['is_real'],
        'extension_code': goods['extension_code'],
        'is_gift': 0,
        'is_shipping': goods['is_shipping'],
        'rec_type': 'CART_GENERAL_GOODS'
    };


    /* 如果数量不为0，作为基本件插入 */
    if (num > 0) {
        /* 检查该商品是否已经存在在购物车中 */
        let cartObj = await Cart.getOne();

        console.log(cartObj)
        if (cartObj) {
            //如果购物车已经有此物品，则更新
            num += cartObj['goods_number'];
            goods_storage = goods['goods_number'];
            if (num <= goods_storage) {
                goods_price = get_final_price(goods['shop_price'], num);

                // $sql = "UPDATE ".$GLOBALS['ecs'] - > table('cart').
                // " SET goods_number = '$num'".
                // " , goods_price = '$goods_price'".
                // " WHERE session_id = '".SESS_ID.
                // "' AND goods_id = '$goods_id' ".
                // " AND parent_id = 0 AND goods_attr = '".get_goods_attr_info($spec).
                // "' ".
                // " AND extension_code <> 'package_buy' ".
                // "AND rec_type = 'CART_GENERAL_GOODS'";
                // $GLOBALS['db'] - > query($sql);

                await Cart.update({
                    goods_number: num,
                    goods_price: goods_price
                });
            } else {
                return '购买数量超出库存';
            }
        } else {
            //购物车没有此物品，则插入
            goods_price = get_final_price(goods['shop_price'], num);
            $parent['goods_price'] = Math.max(goods_price, 0);
            $parent['goods_number'] = num;
            $parent['parent_id'] = 0;
            console.log($parent);
            await Cart.insert($parent);
        }
    }

    return 'success';
}

function get_final_price(price, num) {
    return price * num;
}

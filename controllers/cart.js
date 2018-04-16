const Redis = require('../utils/redis.js');
const Goods = require('../models/goods.js');
const Cart = require('../models/cart.js');

exports.getTest = async(ctx, next) => {
    let cartObj = await Cart.getByGoodsIdAndUserId(33, 47);
    ctx.body = cartObj;
}

/**
 * 获取购物车
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.getList = async(ctx, next) => {
    let token = ctx.request.header.token
    let user = await Redis.getUser({
        key: token
    })
    if (!user.userId) {
        ctx.throw(401);
        return;
    }

    if (!user.warehouseId) {
        ctx.throw(400, '缺少参数warehouseId');
        return;
    }

    let result = await Cart.getAllByUserIdAndWarehouseId(user.userId, user.warehouseId);
    ctx.body = result;
}

/**
 * 添加购物车
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.postAdd = async(ctx, next) => {
    let token = ctx.request.header.token
    let user = await Redis.getUser({
        key: token
    })
    if (!user.userId) {
        ctx.throw(401);
        return;
    }

    if (!user.warehouseId) {
        ctx.throw(400, '缺少参数warehouseId');
        return;
    }

    let body = ctx.request.body;
    if (!body.goodsId) {
        ctx.throw(400, '缺少参数goodsId');
        return;
    }

    let result = await addToCart(body.goodsId, 1, user.userId, user.warehouseId);
    if (result === 'success') {
        let result = await Cart.getAllByUserIdAndWarehouseId(user.userId, user.warehouseId);
        ctx.body = result.length;
    } else {
        ctx.throw(400, result);
    }
}

/**
 * 删除购物车
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.postRemove = async(ctx, next) => {
    let token = ctx.request.header.token
    let user = await Redis.getUser({
        key: token
    })
    if (!user.userId) {
        ctx.throw(401);
        return;
    }

    let body = ctx.request.body;
    if (!body.recId) {
        ctx.throw(400, '缺少参数recId');
        return;
    }

    let res = await Cart.remove(user.userId, body.recId);
    if (res > 0) {
        let result = await Cart.getAllByUserIdAndWarehouseId(user.userId, user.warehouseId);
        ctx.body = result.length;
    } else {
        ctx.throw(400, '删除失败');
    }
}

/**
 * 更改购物车数量
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.postChange = async(ctx, next) => {
    let token = ctx.request.header.token
    let user = await Redis.getUser({
        key: token
    })
    if (!user.userId) {
        ctx.throw(401);
        return;
    }

    let body = ctx.request.body;
    if (!body.recId) {
        ctx.throw(400, '缺少参数recId');
        return;
    }

    if (!body.quantity) {
        ctx.throw(400, '缺少参数quantity');
        return;
    }

    let cartObj = await Cart.getByRecIdAndUserId(body.recId, user.userId);
    if (!cartObj) {
        ctx.throw(400, '购物车不存在该商品');
        return;
    }

    let res = await Cart.update(body.recId, {
        goods_number: body.quantity,
    });

    if (res > 0) {
        let result = await Cart.getAllByUserIdAndWarehouseId(user.userId, user.warehouseId);
        ctx.body = result.length;
    } else {
        ctx.throw(400, '更改失败');
    }
}


/**
 * 添加商品到购物车
 *
 * @access  public
 * @param   integer goodsId   商品编号
 * @param   integer num        商品数量
 * @param   integer userId    用户ID
 * @param   integer warehouseId    仓库ID
 * @return  boolean
 */
async function addToCart(goodsId, num = 1, userId, warehouseId) {

    // /* 取得商品信息 */
    let goods = await Goods.detail(goodsId, warehouseId);

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

    /* 初始化要插入购物车的基本件数据 */
    $parent = {
        'user_id': userId,
        'goods_id': goodsId,
        'goods_sn': goods['goods_sn'],
        'goods_thumb': goods['goods_thumb'],
        'product_id': '0',
        'goods_name': goods['goods_name'],
        'market_price': goods['market_price'],
        'goods_attr': '',
        'goods_attr_id': '',
        'is_real': goods['is_real'],
        'extension_code': goods['extension_code'],
        'is_gift': 0,
        'is_shipping': goods['is_shipping'],
        'rec_type': '1',
        'warehouse_id': warehouseId,
    };


    /* 如果数量不为0，作为基本件插入 */
    if (num > 0) {
        /* 检查该商品是否已经存在在购物车中 */
        let cartObj = await Cart.getByGoodsIdAndUserId(goodsId, userId);

        if (cartObj) {
            //如果购物车已经有此物品，则更新
            num += cartObj['goods_number'];
            goods_storage = goods['goods_number'];
            if (num <= goods_storage) {
                goods_price = get_final_price(goods['shop_price'], num);

                await Cart.update(cartObj.rec_id, {
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
            await Cart.insert($parent);
        }
    }

    return 'success';
}

function get_final_price(price, num) {
    return price * num;
}

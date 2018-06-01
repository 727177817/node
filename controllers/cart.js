const Redis = require('../utils/redis.js');
const Goods = require('../models/goods.js');
const Cart = require('../models/cart.js');
const BaseController = require('./basecontroller.js');

/**
 * 购物车相关接口
 */
class CartController extends BaseController {
    constructor() {
        super();
    }

    async getTest(ctx, next) {
        let cartObj = await Cart.getByGoodsIdAndUserId(33, 47);
        ctx.body = cartObj;
    }


    /**
     * 获取所有购物车数量
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    async getCartCount(ctx, next) {
        if (!this.checkUserIntegrity(ctx)) {
            return;
        }

        let user = ctx.user;
        let result = await Cart.getCountByUserIdAndWarehouseId(user.userId, user.warehouseId);

        ctx.body = result;
    }

    /**
     * 获取购物车
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    async getList(ctx, next) {
        if (!this.checkUserIntegrity(ctx)) {
            return;
        }

        let user = ctx.user;
        let result = await Cart.getAllByUserIdAndWarehouseId(user.userId, user.warehouseId);

        // 计算购物车的数量和价格
        ctx.body = {
            goods: result,
            total: this.calcTotal(result)
        };
    }

    /**
     * 添加购物车
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    async postAdd(ctx, next) {
        if (!this.checkUserIntegrity(ctx)) {
            return;
        }

        let body = ctx.request.body;
        let user = ctx.user;
        if (!body.goodsId) {
            ctx.throw(400, '缺少参数goodsId');
            return;
        }

        let result = await this.addToCart(body.goodsId, 1, user.userId, user.warehouseId);
        if (result === 'success') {
            let result = await Cart.getAllByUserIdAndWarehouseId(user.userId, user.warehouseId);
            ctx.body = result;
        } else {
            ctx.throw(400, result);
        }
    }

    /**
     * 移除购物车中的商品
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    async postRemove(ctx, next) {
        let body = ctx.request.body;
        let user = ctx.user;
        if (!body.recId) {
            ctx.throw(400, '缺少参数recId');
            return;
        }

        let res = await Cart.remove(user.userId, body.recId);
        if (res > 0) {
            let result = await Cart.getAllByUserIdAndWarehouseId(user.userId, user.warehouseId);
            ctx.body = result;
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
    async postChange(ctx, next) {
        let body = ctx.request.body;
        let user = ctx.user;
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

        // 校验商品库存
        let goods = await Goods.detail(cartObj.goods_id, user.warehouseId);
        if (body.quantity > goods.goods_number) {
            ctx.throw(400, '操作失败，商品库存不足');
            return;
        }

        let res = await Cart.update(body.recId, {
            goods_number: body.quantity,
        });

        if (res > 0) {
            let result = await Cart.getAllByUserIdAndWarehouseId(user.userId, user.warehouseId);
            ctx.body = result;
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
    async addToCart(goodsId, num = 1, userId, warehouseId) {

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

        //检查：商品购买数量是否大于总库存
        if (goods['goods_number'] == 0) {
            return '加入购物车失败，该商品已售罄';
        }
        /* 检查：库存 */
        //检查：商品购买数量是否大于总库存
        if (num > goods['goods_number']) {
            return '加入购物车失败，购买数量超出库存';
        }

        /* 初始化要插入购物车的基本件数据 */
        let $parent = {
            'user_id': userId,
            'goods_id': goodsId,
            'goods_sn': goods['goods_sn'],
            'goods_thumb': goods['goods_thumb'],
            'product_id': '0',
            'goods_name': goods['goods_name'],
            'market_price': goods['market_price'],
            'goods_weight': goods['goods_weight'],
            'goods_attr': '',
            'goods_attr_id': '',
            'is_real': goods['is_real'],
            'extension_code': goods['extension_code'],
            'is_gift': 0,
            'is_shipping': goods['is_shipping'],
            'rec_type': '1',
            'warehouse_id': warehouseId
        };


        /* 如果数量不为0，作为基本件插入 */
        if (num > 0) {
            /* 检查该商品是否已经存在在购物车中 */
            let cartObj = await Cart.getByGoodsIdAndUserId(goodsId, userId);

            if (cartObj) {
                //如果购物车已经有此物品，则更新
                num += cartObj['goods_number'];
                let goods_storage = goods['goods_number'];
                if (num <= goods_storage) {
                    let goods_price = this.getFinalPrice(goods['shop_price'], num);

                    await Cart.update(cartObj.rec_id, {
                        goods_number: num,
                        goods_price: goods_price
                    });
                } else {
                    return '加入购物车失败，商品库存不足';
                }
            } else {
                //购物车没有此物品，则插入
                let goods_price = this.getFinalPrice(goods['shop_price'], num);
                $parent['goods_price'] = Math.max(goods_price, 0);
                $parent['goods_number'] = num;
                $parent['parent_id'] = 0;
                await Cart.insert($parent);
            }
        }

        return 'success';
    }

    /**
     * 获取购物车总价
     * @param  {[type]} price [description]
     * @param  {[type]} num   [description]
     * @return {[type]}       [description]
     */
    getFinalPrice(price, num) {
        // return price * num;
        return price;
    }

    /**
     * 取得购物车小计，包括总价和数量等
     * @param {array} 购物车商品
     * @return  float   购物车总计
     */
    calcTotal(cartGoods) {
        let total = {
            price: 0,
            quantity: 0
        };

        cartGoods.map((item) => {
            total.price += item.goods_price * item.goods_number;
            total.quantity += item.goods_number * 1;
        });

        // 取整保留2位小数
        total.price = Math.round(total.price * 100) / 100;

        return total;
    }

}

module.exports = new CartController();

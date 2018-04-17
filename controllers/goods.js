const Redis    = require('../utils/redis.js');
const Goods = require('../models/goods.js');

/* 获取商品详情
 * @param {String} [goodsId]   goodsId为商品id
 * 
*/ 
exports.detail = async (ctx, next) => {
    let token = ctx.request.header.token
    let warehouseId = await Redis.getUser({
        key: token,
        field: 'warehouseId'
    })
    if(!warehouseId){
        ctx.throw(400, '缺少参数warehouseId');
        return;
    }

    let goodsId = ctx.query.goodsId;
    if(!goodsId){
        ctx.throw(400, '缺少参数goodsId');
        return;
    }
    let goods = await Goods.detail(goodsId,warehouseId); 
    ctx.body = goods;
}


/* 获取商品详情
 * @param {String} [goodsId]   goodsId为商品id
 * 
*/ 
exports.hot = async (ctx, next) => {
    let token = ctx.request.header.token
    let warehouseId = await Redis.getUser({
        key: token,
        field: 'warehouseId'
    })
    if(!warehouseId){
        ctx.throw(400, '缺少参数warehouseId');
        return;
    }
    // 热销商品
	let hotGoods = await Goods.hotGoods(warehouseId)
    ctx.body = hotGoods;
}
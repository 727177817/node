const Redis    = require('../utils/redis.js');
const Goods = require('../models/goods.js');

/* 获取商品详情
 * @param {String} [goodsId]   goodsId为商品id
 * 
*/ 
exports.detail = async (ctx, next) => {
    let token = ctx.request.header.token
    let suppliersId = await Redis.getUser({
        key: token,
        field: 'suppliersId'
    })
    if(!suppliersId){
        ctx.throw(400, '缺少参数suppliersId');
        return;
    }

    let goodsId = ctx.query.goodsId;
    if(!goodsId){
        ctx.throw(400, '缺少参数goodsId');
        return;
    }
    let goods = await Goods.detail(goodsId,suppliersId); 
    ctx.body = goods;
}


/* 获取商品详情
 * @param {String} [goodsId]   goodsId为商品id
 * 
*/ 
exports.hot = async (ctx, next) => {
    let token = ctx.request.header.token
    let suppliersId = await Redis.getUser({
        key: token,
        field: 'suppliersId'
    })
    if(!suppliersId){
        ctx.throw(400, '缺少参数suppliersId');
        return;
    }
    // 热销商品
	let hotGoods = await Goods.hotGoods(suppliersId)
    ctx.body = hotGoods;
}
const Goods = require('../models/goods.js');

/* 获取商品详情
 * @param {String} [goodsId]   goodsId为商品id
 * 
*/ 
exports.detail = async (ctx, next) => {
    let goodsId = ctx.query.goodsId;
    if(!goodsId){
        ctx.throw(400, '缺少参数goodsId');
        return;
    }
    let goods = await Goods.detail(goodsId); 
    ctx.body = goods;
}
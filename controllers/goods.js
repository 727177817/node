const Goods = require('../models/goods.js');

/* 获取商品详情
 * @param {String} [goods_id]   goods_id为商品id
 * 
*/ 
exports.detail = async (ctx, next) => {
    let goods_id = ctx.query.goods_id;
    if(!goods_id){
        ctx.throw(400, '缺少参数goods_id');
        return;
    }
    let goods = await Goods.detail(goods_id); 
    ctx.body = goods;
}
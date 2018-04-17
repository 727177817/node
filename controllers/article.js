const Redis    = require('../utils/redis.js');
const Article = require('../models/article.js');


/*
 * 获取文章详情
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @param {[type]}   id     [地址Id]
 * @return {[type]}   detail     [地址详情]
 */ 
exports.getDetail = async(ctx, next) => {
    let id = ctx.query.id;
    if(!id){
        ctx.throw(400, '缺少参数id');
        return;
    }

    let detail = await Article.getOne(id);
    ctx.body = detail;
}
const Article = require('../models/article.js');
const BaseController = require('./basecontroller.js');

/**
 * 文章相关接口
 */
class ArticleController extends BaseController {
    constructor() {
        super();
    }

    /*
     * 获取文章详情
     */
    async getDetail(ctx, next) {
        let id = ctx.query.id;
        if (!id) {
            ctx.throw(400, '缺少参数id');
            return;
        }

        let detail = await Article.getOne(id);
        ctx.body = detail;
    }
}

module.exports = new ArticleController();

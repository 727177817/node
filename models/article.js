const Model = require('../models/model');

class Article extends Model {

    constructor() {
        super();

        this.name = 'ecs_article';
    }

    async getOne(id) {
        return await this.db(this.name)
            .where({
                article_id: id
            }).first();
    }

    /**
     * 获取首页需要的公告
     * 1. 获取一个指定分类下的文章
     * 2. 获取当前小区或未指定小区的文章
     * 3. 获取显示的文章
     * 4. 按照是否置顶和添加时间倒序排列
     * @param  {[type]} communityId [description]
     * @param  {[type]} catId       [description]
     * @return {[type]}             [description]
     */
    async getArticlesForHome(communityId, catId) {
        return await this.db
            .select().from(this.name)
            .where({
                community_id: communityId,
                cat_id: catId,
                is_open: 1
            }).orWhere('community_id', 0)
            .orderBy('article_type', 'desc')
            .orderBy('add_time', 'desc');
    }


}
module.exports = new Article();

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

    async getArticlesForHome(communityId, catId) {
        return await this.db
            .select().from(this.name).where({
                community_id: communityId,
                cat_id: catId
            });
    }


}
module.exports = new Article();

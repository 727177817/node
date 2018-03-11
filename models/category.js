const Model = require('../models/model');

class Category extends Model {

    constructor() {
        super();
    }

    // 首页分类
    async homeAds() {
        var list = await this.db
            .select().from('ecs_category').where('show_in_nav', 1).orderBy('sort_order');
        return list
    }

}
module.exports = new Category();


const Model = require('../models/model');

class Category extends Model {

    constructor() {
        super();
        this.name = "ecs_category"
    }

    // 首页广告分类
    async homeAds() {
        var list = await this.db
            .select().from(this.name).where({'show_in_nav': 1}).orderBy('sort_order');
        return list
    }

    // 获取所有分类
    async category() {
        var list = await this.db
            .select().from(this.name);
        return list
    }

}
module.exports = new Category();


const Model = require('../models/model');

class Category extends Model {

    constructor() {
        super();
        this.name = "ecs_category"
    }

    // 获取展示在首页的分类
    async getCategoryForHome() {
        return await this.db
            .select().from(this.name)
            .where({ 'show_in_nav': 1, 'is_show': 1 })
            .orderBy('sort_order', 'desc');
    }

    // 获取所有分类
    async getAll() {
        return await this.db
            .select().from(this.name)
            .where({ 'is_show': 1 })
            .orderBy('sort_order', 'desc');
    }

}
module.exports = new Category();

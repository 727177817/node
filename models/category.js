const Model = require('../models/model');

class Category extends Model {

    constructor() {
        super();
    }

    async list() {
        var category = await this.db
            .select().from('ecs_category').where('show_in_nav', 1).orderBy('sort_order');
        return category
    }

}
module.exports = new Category();


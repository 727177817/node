const Model = require('../models/model');

class Goods extends Model {

    constructor() {
        super();

    }

    async getList() {
        var ret = await this.db
            .select().limit(3).from('ecs_goods')
        return ret
    }

}
module.exports = new Goods();


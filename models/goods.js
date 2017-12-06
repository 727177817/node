const Model = require('../models/model');

class Goods extends Model {

    constructor() {
        super();

    }

    async getList() {
        var ret = await this.db
            .select().from('ecs_goods')
        return ret[0]
    }

}
module.exports = new Goods();


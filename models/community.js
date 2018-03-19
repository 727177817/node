const Model = require('../models/model');

class Community extends Model {

    constructor() {
        super();
        this.name = 'ecs_community'
    }

    async getOne(id) {
        return await this.db(this.name).where({
            community_id: id
        }).first();
    }

    async getList() {
        return await this.db(this.name)
            .select();
    }

}
module.exports = new Community();

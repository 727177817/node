const Model = require('../models/model');

class PayLog extends Model {

    constructor() {
        super();
        this.name = 'ecs_pay_log'
    }

    async getOne(id) {
        return await this.db(this.name)
            .where({
                log_id: id
            }).first();
    }
}
module.exports = new PayLog();

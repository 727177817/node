const Model = require('../models/model');


class Passport extends Model {

    constructor() {
        super();
    }

    async wechatLogin(union_id) {
        var detail = await this.db
            .select().from('ecs_users').where('union_id', union_id);
        return detail
    }

}
module.exports = new Passport();


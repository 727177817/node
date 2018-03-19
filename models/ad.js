const Model = require('../models/model');

class Ads extends Model {

    constructor() {
        super();
    }

    async banner() {
        var banner = await this.db
            .select().from('ecs_ad')
        return banner
    }


}
module.exports = new Ads();
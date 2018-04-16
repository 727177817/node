const Model = require('../models/model');

class Ads extends Model {

    constructor() {
        super();
    }

    async banner(communityId) {
        var banner = await this.db
            .select().from('ecs_ad').where({
            	community_id: communityId
            })
        return banner
    }


}
module.exports = new Ads();
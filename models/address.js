const Model = require('../models/model');

class Address extends Model {

    constructor() {
        super();
        this.name = 'ecs_user_address';
    }

    async getOne(id) {
        return await this.db(this.name)
            .where({
                address_id: id
            }).first();
    }

    async getOneWithUserId(userId, id) {
        return await this.db(this.name)
            .where({
                address_id: id,
                user_id: userId
            }).first();
    }

    async getAllByUserId(userId) {
        return await this.db(this.name)
            .where({
                user_id: userId
            }).select();
    }

    async getAllByUserIdAndCommunityId(userId, communityId) {
        return await this.db(this.name)
            .where({
                user_id: userId,
                community_id: communityId
            }).select();
    }


}
module.exports = new Address();

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

    async getAllByUserIdAndCommunityIds(userId, communityIds) {
        return await this.db(this.name)
            .leftJoin('ecs_community as c', 'ecs_user_address.community_id', 'c.community_id')
            .where({
                user_id: userId
            })
            .andWhere('c.community_id', 'in', communityIds)
            .select();
    }

    async insert(data){
        return this.db(this.name).insert(data);
    }

    async update(addressId,data){
        return this.db(this.name).where({
            address_id: addressId
        }).update(data);
    }

    async remove(addressId){
        return this.db(this.name).where({
            address_id: addressId
        }).delete();
    }

}
module.exports = new Address();

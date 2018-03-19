const Model = require('../models/model');

class Cart extends Model {

    constructor() {
        super();

        this.name = 'ecs_cart';
    }

    async getOne(goodsId) {
        let obj = this.db(this.name).where({
            goods_id: goodsId,
            parent_id: 0,
            rec_type: '1'
        }).first()

        return obj;
    }

    async getByGoodsIdAndUserId(goodsId, userId) {
        let obj = this.db(this.name).where({
            goods_id: goodsId,
            parent_id: 0,
            rec_type: '1',
            user_id: userId
        }).first();
        
        return obj;
    }

    async getByRecIdAndUserId(recId, userId) {
        let obj = this.db(this.name).where({
            rec_id: recId,
            parent_id: 0,
            rec_type: '1',
            user_id: userId
        }).first();
        
        return obj;
    }

    async insert(data){
        return this.db(this.name).insert(data);
    }

    async update(recId, data){
        return this.db(this.name).where({
            rec_id: recId
        }).update(data);
    }

    async remove(userId, recId){
        return this.db(this.name).where({
            rec_id: recId,
            user_id: userId
        }).delete();
    }

    async clear(userId, suppliersId){
        return this.db(this.name).where({
            suppliers_id: suppliersId,
            user_id: userId
        }).delete();
    }

    async getAllByUserIdAndSuppliersId(userId, suppliersId) {
        var detail = await this.db
            .select().from(this.name).where({'user_id': userId, 'suppliers_id': suppliersId});
        return detail
    }

}
module.exports = new Cart();

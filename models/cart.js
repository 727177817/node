const Model = require('../models/model');

class Cart extends Model {

    constructor() {
        super();

        this.name = 'ecs_cart';
    }

    async getOne(goodsId) {
        let obj = this.db(this.name).where({
            goods_id: goodsId,
            parent_id: '0',
            rec_type: '1'
        }).first()

        return obj;
    }

    async getByGoodsIdAndUserId(goodsId, userId) {
        let obj = await this.db(this.name).where({
            goods_id: goodsId,
            // parent_id: '0',
            // rec_type: '1',
            user_id: userId
        }).first();

        return obj;
    }

    async getByRecIdAndUserId(recId, userId) {
        let obj = await this.db(this.name).where({
            rec_id: recId,
            parent_id: 0,
            rec_type: '1',
            user_id: userId
        }).first();

        return obj;
    }

    async insert(data) {
        return await this.db(this.name).insert(data);
    }

    async update(recId, data) {
        return await this.db(this.name).where({
            rec_id: recId
        }).update(data);
    }

    async remove(userId, recId) {
        return await this.db(this.name).where({
            rec_id: recId,
            user_id: userId
        }).delete();
    }

    async clear(userId, warehouseId) {
        return await this.db(this.name).where({
            warehouse_id: warehouseId,
            user_id: userId
        }).delete();
    }

    async getAllByUserIdAndWarehouseId(userId, warehouseId) {
        return await this.db
            .select().from(this.name).where({
                'user_id': userId,
                'warehouse_id': warehouseId
            });
    }

    async getCountByUserIdAndWarehouseId(userId, warehouseId) {
        return await this.db
            .count('* as count').from(this.name).where({
                'user_id': userId,
                'warehouse_id': warehouseId
            });
    }

    async getCartAmount(userId,warehouseId) {
        return await this.db(this.name).sum('goods_price * goods_number').where({
            'user_id': userId,
            'warehouse_id': warehouseId
        });
    }

}
module.exports = new Cart();
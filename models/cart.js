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

    /**
     * 获取购物车商品
     * 1. 根据仓库筛选
     * 2. 过滤没有上架以及删除的商品
     * @param  {[type]} userId      [description]
     * @param  {[type]} warehouseId [description]
     * @return {[type]}             [description]
     */
    async getAllByUserIdAndWarehouseId(userId, warehouseId) {
        return await this.db
            .select('ecs_cart.*', 'ecs_goods.goods_thumb', 'ecs_goods.goods_img', 'ecs_goods.goods_number as store').from(this.name)
            .leftJoin('ecs_goods', 'ecs_cart.goods_id', 'ecs_goods.goods_id')
            .where({
                'user_id': userId,
                'ecs_cart.warehouse_id': warehouseId,
                'ecs_goods.is_delete': 0,
                'ecs_goods.is_on_sale': 1
            });
    }

    /**
     * 获取购物车商品数量
     * 过滤规则同上
     * @param  {[type]} userId      [description]
     * @param  {[type]} warehouseId [description]
     * @return {[type]}             [description]
     */
    async getCountByUserIdAndWarehouseId(userId, warehouseId) {
        return await this.db
            .count('* as count').from(this.name)
            .leftJoin('ecs_goods', 'ecs_cart.goods_id', 'ecs_goods.goods_id')
            .where({
                'user_id': userId,
                'ecs_cart.warehouse_id': warehouseId,
                'ecs_goods.is_delete': 0,
                'ecs_goods.is_on_sale': 1
            });
    }

}
module.exports = new Cart();

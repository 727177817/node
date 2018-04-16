const Model = require('../models/model');

class Coupon extends Model {

    constructor() {
        super();
    }
    // 未使用红包
    async unused(userId) {
        var list = await this.db('ecs_user_bonus')
            .select()
            .leftJoin('ecs_bonus_type', 'ecs_user_bonus.bonus_type_id', 'ecs_bonus_type.type_id')
            .where({
            	user_id: userId,
            	order_id: 0
            })
        return list
    }

    // 已使用红包
    async used(userId) {
        var list = await this.db('ecs_user_bonus')
            .select()
            .leftJoin('ecs_bonus_type', 'ecs_user_bonus.bonus_type_id', 'ecs_bonus_type.type_id')
            .where('user_id', userId)
            .whereNot('order_id',0)
        return list
    }

    // 过期红包
    async expired(userId,date) {
        var list = await this.db('ecs_user_bonus')
            .select()
            .leftJoin('ecs_bonus_type', 'ecs_user_bonus.bonus_type_id', 'ecs_bonus_type.type_id')
            .where('user_id', userId)
            .andWhere('use_end_date', '>', date)
        return list
    }


}
module.exports = new Coupon();
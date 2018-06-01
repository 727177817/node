const Model = require('../models/model');

class Coupon extends Model {

    constructor() {
        super();

        this.name = 'ecs_user_bonus as bonus';
    }

    async getOne(id) {
        return await this.db(this.name)
            .leftJoin('ecs_bonus_type', 'bonus.bonus_type_id', 'ecs_bonus_type.type_id')
            .where({
                bonus_id: id
            }).first();
    }


    async getOneByBonusSn(bonusSn) {
        return await this.db(this.name)
            .leftJoin('ecs_bonus_type', 'bonus.bonus_type_id', 'ecs_bonus_type.type_id').where({
                bonus_sn: bonusSn
            }).first();
    }

    // 未使用红包s
    async unused(userId, timestamp) {
        var list = await this.db(this.name)
            .select()
            .leftJoin('ecs_bonus_type', 'bonus.bonus_type_id', 'ecs_bonus_type.type_id')
            .where({
                user_id: userId,
                order_id: 0
            })
            .andWhere('use_end_date', '>', timestamp)
        return list
    }

    // 已使用红包
    async used(userId, timestamp) {
        var list = await this.db(this.name)
            .select()
            .leftJoin('ecs_bonus_type', 'bonus.bonus_type_id', 'ecs_bonus_type.type_id')
            .where('user_id', userId)
            .whereNot('order_id', 0)
        return list
    }

    // 过期红包
    async expired(userId, timestamp) {
        var list = await this.db(this.name)
            .select()
            .leftJoin('ecs_bonus_type', 'bonus.bonus_type_id', 'ecs_bonus_type.type_id')
            .where('user_id', userId)
            .andWhere('use_end_date', '<', timestamp)
        return list
    }

    // 获取当前可用的红包
    async getAvaliableCoupons(userId, amount, timestamp) {
        var list = await this.db(this.name)
            .select()
            .leftJoin('ecs_bonus_type', 'bonus.bonus_type_id', 'ecs_bonus_type.type_id')
            .where({
                user_id: userId,
                order_id: 0
            })
            .andWhere('min_goods_amount', '<=', amount)
            .andWhere('use_end_date', '>=', timestamp)
        return list
    }

    async update(bonus_id, data) {
        return await this.db(this.name).where({
            bonus_id: bonus_id
        }).update(data);
    }

    async setUsed(bonusId, orderId, usedTime) {
        return await this.db(this.name).where({
            bonus_id: bonusId
        }).update({
            order_id: orderId,
            used_time: usedTime
        });
    }

    async setUnUsed(bonusId){
        return await this.db(this.name).where({
            bonus_id: bonusId
        }).update({
            order_id: 0,
            used_time: 0
        });
    }
    
}
module.exports = new Coupon();

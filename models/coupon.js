const Model = require('../models/model');

class Coupon extends Model {

    constructor() {
        super();
    }

    async list(userId,orderId) {
        var list = await this.db('ecs_user_bonus')
            .select()
            .leftJoin('ecs_bonus_type', 'ecs_user_bonus.bonus_type_id', 'ecs_bonus_type.type_id')
            .where({
            	user_id: userId
            })
            .whereNot({
            	order_id: orderId
            })
        return list
    }


}
module.exports = new Coupon();
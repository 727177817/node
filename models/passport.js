const Model = require('../models/model');


class Passport extends Model {

    constructor() {
        super();
    }

    async wechatLogin(union_id) {
        var detail = await this.db
            .select().from('ecs_users').where('unionid', union_id);
        return detail
    }

    async wechatRegister(userinfo) {
        await this.db('ecs_users')
            .insert({
            	union_id: unionid,
            	open_id: openid,
            	user_name: '9523',
            	reg_time: Date.parse(new Date())/1000
            })
        return "注册成功"
    }

}
module.exports = new Passport();


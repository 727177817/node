const Model = require('../models/model');

class Wechat extends Model {

    constructor() {
        super();
    }

    // 保存sessionKey
    async insertSessionKey(data) {
        await this.db('ecs_wechat_session').insert(data);
    }

    // 更新sessionKey
    async updataSessionKey(data) {
        await this.db('ecs_wechat_session').update(data);
    }

    // 查询openid是否存在
    async selectOpenId(open_id) {
        let result = await this.db('ecs_wechat_session').where({
        	open_id: open_id
        });
        return result
    }

    // 查询openid是否存在
    async selectSessionId(session_id) {
        let result = await this.db('ecs_wechat_session').frist().where({
        	session_id: session_id
        });
        return result
    }


}

module.exports = new Wechat();


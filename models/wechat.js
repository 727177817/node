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
    async selectOpenId(openId) {
        let result = await this.db('ecs_wechat_session').where({
        	open_id: openId
        });
        return result
    }

    // 查询openid是否存在
    async selectSessionId(sessionId) {
        let result = await this.db('ecs_wechat_session').first().where({
        	session_id: sessionId
        });
        return result
    }


}

module.exports = new Wechat();


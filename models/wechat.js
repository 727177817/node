const Model = require('../models/model');

class Wechat extends Model {

    constructor() {
        super();
        this.name = 'ecs_wechat_session'
    }

    // 保存sessionKey
    async insertSessionKey(data) {
        await this.db(this.name).insert(data);
    }

    // 更新sessionKey
    async updataSessionKey(data) {
        await this.db(this.name).where({
            open_id: data.open_id
        }).update(data);
    }

    // 查询openid是否存在
    async selectOpenId(openId) {
        let result = await this.db(this.name).where({
        	open_id: openId
        });
        return result
    }

    // 查询openid是否存在
    async selectSessionId(sessionId) {
        let result = await this.db(this.name).first().where({
        	session_id: sessionId
        });
        return result
    }


}

module.exports = new Wechat();


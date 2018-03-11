const Model = require('../models/model');


class Passport extends Model {

    constructor() {
        super();
    }

    // 微信注册
    async wechatRegister(userinfo) {
    	try{
    		await this.db('ecs_users')
            .insert({
            	union_id: userinfo.unionId,
	            open_id: userinfo.openId,
	            user_name: userinfo.nickName,
	            mobile_phone: userinfo.phone,
	            avatarUrl: userinfo.avatarUrl,
	            sex: userinfo.gender,
	            province: userinfo.province,
	            country: userinfo.country,
	            city: userinfo.city,
	            language: userinfo.language,
            	reg_time: Date.parse(new Date())/1000
            })
        	return "注册成功"
    	} catch(err) {
    		return err.sqlMessage
    	}
        
    }

    // 获取用户信息,
    async getUserInfo(id) {
    	try{
	        let userinfo = await this.db
	            .first('user_name','sex','avatarUrl','mobile_phone').from('ecs_users').where('user_id', id);
	        return userinfo
    	} catch(err){
    		return err.sqlMessage
    	}
    }

    // 获取用户信息,
    async getHasUnionId(union_id){
    	try{
	        let userinfo = await this.db
	        	.from('ecs_users')
	            .where('union_id', union_id)
	            .select()
	        return userinfo
    	} catch(err){
    		return err.sqlMessage
    	}
    }

}
module.exports = new Passport();


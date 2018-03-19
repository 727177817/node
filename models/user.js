const Model = require('../models/model');


class Passport extends Model {

    constructor() {
        super();
        this.name = 'ecs_users'
    }

    // 微信注册
    async wechatRegister(userInfo) {
    	try{
    		await this.db(this.name)
            .insert({
            	union_id: userInfo.unionId,
	            open_id: userInfo.openId,
	            user_name: userInfo.nickName,
	            mobile_phone: userInfo.phone,
	            avatarUrl: userInfo.avatarUrl,
	            sex: userInfo.gender,
	            province: userInfo.province,
	            country: userInfo.country,
	            city: userInfo.city,
	            language: userInfo.language,
            	reg_time: Date.parse(new Date())/1000
            })
        	return "注册成功"
    	} catch(err) {
    		return err.sqlMessage
    	}
        
    }

    // 获取用户信息, 用user_id获取用户信息
    async getUserInfo(id) {
    	try{
	        let userInfo = await this.db
	            .first().from(this.name).where('user_id', id);
	        return userInfo
    	} catch(err){
    		return err.sqlMessage
    	}
    }

    // 获取用户信息，用unionId获取
    async getUserInfoWechat(union_id){
    	try{
	        let userInfo = await this.db
                .first('avatarUrl','user_name','supplier_id').from(this.name).where('union_id', union_id);
	        return userInfo
    	} catch(err){
    		return err.sqlMessage
    	}
    }

}
module.exports = new Passport();


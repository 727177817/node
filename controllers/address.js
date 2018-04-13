const Redis    = require('../utils/redis.js');
const Address = require('../models/address.js');

 /*
 * 获取所有分类和分类商品
 */ 
exports.add = async(ctx, next) => {
	let token = ctx.request.header.token
	let user = await Redis.getUser({
		key: token
	})
	if(!user.userId || !user.communityId){
        ctx.throw(401);
        return;
    }
    
	// 获取首页商品分类
	let data = {
		address_name: '',
		user_id: userId,
		consignee: '',
		country: '',
		province: '',
		city: '',
		district: '',
		mobile: '',
		sign_building: '',
		best_time: '',
		community_id: '',
		address: ''
	}
	let address  = await Address.add(data)
	
    ctx.body = address;
}
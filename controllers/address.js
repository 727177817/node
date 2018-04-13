const Redis    = require('../utils/redis.js');
const Address = require('../models/address.js');
const Community = require('../models/community.js');

 /*
 * 添加收货地址
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @param {[type]}   consignee     [收货人]
 * @return {[type]}   address     [新增地址]
 */ 
exports.postAdd = async(ctx, next) => {
	let body = ctx.request.body;
	if(!body.consignee){
        ctx.throw(400, '缺少参数consignee');
        return;
    }

    if(!body.mobile){
        ctx.throw(400, '缺少参数mobile');
        return;
    }


    if(!body.address){
        ctx.throw(400, '缺少参数address');
        return;
    }
	let token = ctx.request.header.token
	let user = await Redis.getUser({
		key: token
	})
	if(!user.userId){
        ctx.throw(401);
        return;
    }
    if(!user.communityId){
        ctx.throw(400, '缺少参数communityId');
        return;
    }

	// 获取首页商品分类
	let data = {
		user_id: user.userId,
		community_id: user.communityId,
		consignee: body.consignee,
		mobile: body.mobile,
		address: body.address
	}
	let lastId = await Address.insert(data)
	let address  = await Address.getOne(lastId)

    ctx.body = address;
}
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

    let address = ''
	// 如果addressId存在，更新收货地址
    if(body.addressId){
        // 更新收货地址
        let data = {
            user_id: user.userId,
            community_id: user.communityId,
            consignee: body.consignee,
            mobile: body.mobile,
            address: body.address
        }
        await Address.update(body.addressId,data)
        address = await Address.getOneWithUserId(user.userId, body.addressId)
    }else{
        // 新增收货地址
        let data = {
            user_id: user.userId,
            community_id: user.communityId,
            consignee: body.consignee,
            mobile: body.mobile,
            address: body.address
        }
        let lastId = await Address.insert(data)
        address  = await Address.getOneWithUserId(user.userId, lastId)
    }

    ctx.body = address;
}


/*
 * 获取用户地址列表
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}   list     [地址列表]
 */ 
exports.getList = async(ctx, next) => {
    let token = ctx.request.header.token
    let userId = await Redis.getUser({
        key: token,
        field: 'userId'
    })
    if(!userId){
        ctx.throw(401);
        return;
    }

    let list = await Address.getAllByUserId(userId)
    ctx.body = list;
}


/*
 * 获取地址详情
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @param {[type]}   id     [地址Id]
 * @return {[type]}   detail     [地址详情]
 */ 
exports.getDetail = async(ctx, next) => {
    let token = ctx.request.header.token
    let userId = await Redis.getUser({
        key: token,
        field: 'userId'
    })
    if(!userId){
        ctx.throw(401);
        return;
    }

    let id = ctx.query.id;
    if(!id){
        ctx.throw(400, '缺少参数goodsId');
        return;
    }

    let detail = await Address.getOneWithUserId(userId,id)
    ctx.body = detail;
}
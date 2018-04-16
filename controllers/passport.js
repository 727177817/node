const MD5    = require("crypto-js/md5");
const Redis  = require('../utils/redis.js');
const User   = require('../models/user');
const Community = require('../models/community.js');

/*
 * 微信快捷登录,包含微信注册流程
 */
exports.postWechatLogin = async(ctx, next) => {
    let userinfo = ctx.request.body;
    if(!userinfo.unionId){
        ctx.throw(400, '缺少参数unionId');
        return
    }
    if(!userinfo.openId){
        ctx.throw(400, '缺少参数openId');
        return
    }
    let hasUnionId = await User.getUserInfoWechat(userinfo.unionId); 
    let obj = {}
    if(!hasUnionId){
        obj = await User.wechatRegister(userinfo)
        hasUnionId = obj;
    }else{
        obj = hasUnionId
    }
    // 获取最近使用的小区信息
    let community = await Community.getOne(obj.community_id)
    // 签名加密token, 保存
    let timestamp = Date.parse(new Date())
    let token = MD5(MD5(userinfo.unionId + 'dota') + timestamp).toString();
    await Redis.addUser({
        key: token,
        userId: obj.user_id,
        communityId: obj.community_id,
        warehouseId: community.warehouse_id 
    })

    ctx.body = token;
}
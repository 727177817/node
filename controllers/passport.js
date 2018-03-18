const user   = require('../models/user');
const wechat = require('./wechat');

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
    let hasUnionId = await user.getUserInfoWechat(userinfo.unionId); 
    let obj = {}
    if(!hasUnionId){
        obj = await user.wechatRegister(userinfo)
        hasUnionId = obj;
    }else{
        obj = "登录成功"
    }
    ctx.session = {
        user_id: hasUnionId.user_id
    }
    ctx.body = obj;
}

/*
 * 获取用户信息
 * @param {String} [user_id]   用户user_id
 */
exports.getUserInfo = async(ctx, next) => {
    let userId = ctx.query.userId
    if(!userId){
        ctx.throw(400, '缺少参数userId');
        return
    }else{
        ctx.body = await user.getUserInfo(userId)
    }
}
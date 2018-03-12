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
 * 获取session
 */ 
exports.getSession = async(ctx, next) => {
    ctx.body = ctx;
}

/*
 * 获取用户信息
 * @apiParam {String} [id]   用户user_id
 */
exports.getUserInfo = async(ctx, next) => {
    let user_id = ctx.query.user_id
    if(!user_id){
        ctx.throw(400, '缺少参数user_id');
        return
    }else{
        ctx.body = await user.getUserInfo(user_id)
    }
}
const user = require('../models/user');
const wechat = require('./wechat');

/*
 * 微信快捷登录,包含微信注册流程
 */
exports.postWechatLogin = async(ctx, next) => {
    try {
        let userinfo = ctx.request.body;
        if(!userinfo.unionId){
            ctx.body = "unionId 不能为空";
            return
        }
        if(!userinfo.openId){
            ctx.body = "openId 不能为空";
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
    } catch (err) {
        return 'err';
    }
}

/*
 * 获取session
 */ 
exports.getSession = async(ctx, next) => {
    try {
        ctx.body = ctx;
    } catch (err) {
        return 'err';
    }
}

/*
 * 获取用户信息
 * @apiParam {String} [id]   用户user_id
 */
exports.getUserInfo = async(ctx, next) => {
    try {
        let id = ctx.query.id
        if(!id){
            ctx.body = 'id not exist';
        }else{
            ctx.body = await user.getUserInfo(id)
        }
    } catch (err) {
        return 'err';
    }
}
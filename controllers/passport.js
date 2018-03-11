const user = require('../models/user');
const wechat = require('./wechat');

/*
 * 微信快捷登录,
 */
exports.wechatLogin = async(ctx, next) => {
    try {
        let hasUnionId = await user.getHasUnionId(ctx.query.unionid); 
        if(hasUnionId.length == 0){
            let userinfo = wechat.wechatDecrypt()
            ctx.body = await user.wechatRegister(userinfo)
        }else{
            ctx.body = "登录成功"
        }
        ctx.session = {
            user_id: hasUnionId[0].user_id
        }
    } catch (err) {
        return 'err';
    }
}

/*
 * 微信注册
 */
exports.wechatRegister = async(ctx, next) => {
    try {
        let query = ctx.query
        let userinfo = {
            unionId: query.unionId,
            openId: query.openId,
            nickName: query.nickName,
            phone: query.phone,
            avatarUrl: query.avatarUrl,
            province: query.province,
            country: query.country,
            city: query.city,
            gender: query.gender,
            language: query.language
        }
        userinfo = wechat.wechatDecrypt()
        if(!userinfo.unionId){
            ctx.body = 'unionId miss';
        }else if(!userinfo.openId){
            ctx.body = 'openId miss';
        }else{
            ctx.body = await userinfo
        }
    } catch (err) {
        return 'err';
    }
}

/*
 * 获取session
 */ 
exports.getSession = async(ctx, next) => {
    try {
        ctx.body = ctx.session;
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
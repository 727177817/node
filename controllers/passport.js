const Passport = require('../models/passport');
const wechat = require('./wechat');

/*
 * 微信快捷登录
 */
exports.wechatLogin = async(ctx, next) => {
    try {
        // let token = await Passport.wechatLogin(ctx.query.unionid); 
        if(!!ctx.session){
        	ctx.body = ctx.session;
        }else{
        	ctx.body = 'session is null';
        }
    } catch (err) {
        return 'err';
    }
}


exports.setSession = async(ctx, next) => {
    try {
        ctx.session = {
            user_id: Math.random().toString(36).substr(2),
            count: 0
        }
        ctx.body = ctx.session
    } catch (err) {
        return 'err';
    }
}

/*
 * 微信注册
 */
exports.wechatRegister = async(ctx, next) => {
    try {
        var userinfo = wechat.wechatDecrypt()
        var query = ctx.query
        if(!query.unionid){
            ctx.body = 'unionid miss';
        }else if(!query.openid){
            ctx.body = 'openid miss';
        }else{
            ctx.body = await Passport.wechatRegister(ctx.query.unionid,ctx.query.openid)
        }
    } catch (err) {
        return 'err';
    }
}

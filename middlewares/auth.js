const config = require('../config');
const Redis = require('../utils/redis.js');

/**
 * 在app.use(router)之前调用
 * 用户是否登录拦截器
 */
var auth = async(ctx, next) => {
    if (!excludeAuth(config.EXCLUDE_AUTH_PATH, ctx.request.url)) {
        let token = ctx.request.header.token
        let user = await Redis.getUser({
            key: token
        });

        if (!token || !user) {
            ctx.body = {
                code: 401,
                message: 'Unauthorized'
            }
            return;
        }

        // 将当前登录用户信息存储以便后续路由中使用
        ctx.user = user;
    }

    //其余则继续执行路由
    await next();
}

/**
 * 检测当前请求是否在排除在需要身份验证之外
 * @param  {[type]} excludePaths [description]
 * @param  {[type]} url          [description]
 * @return {[type]}              [description]
 */
function excludeAuth(excludePaths, url) {
    return excludePaths.filter(path => trunToRegExp(path).test(url)).length > 0;
}

/**
 * 把约定好的路径匹配字符串转成正则
 * eg: /common/* => /^\/common(\/.*)*$/
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
function trunToRegExp(str) {
    str = str.replace('/*', '(/.*)*');
    str = '^' + str + '$';
    return new RegExp(str);
}

module.exports = auth;

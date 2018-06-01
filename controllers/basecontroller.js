const Redis = require('../utils/redis.js');

class BaseController {
    constructor() {
        this.redis = Redis;
        this.isAbc = true;
        this.user = null;
    }

    /**
     * [已废弃，移到拦截器处理]
     * 用户是否已登录
     * 1. 根据请求头中的token查找redis
     * 2. 找到对应信息即为已登录
     * 3. 否则返回401错误码
     * @param  {[type]}  ctx [description]
     * @return {Boolean}     [description]
     */
    async hasLogin(ctx) {
        let token = ctx.request.header.token
        let user = await Redis.getUser({
            key: token
        })
        if (!user) {
            ctx.throw(401);
            return false;
        }

        this.user = user;
        return true;
    }

    /**
     * 验证已存储的登录用户信息的完整性
     * 1. 有些接口需要当前用户包含仓库ID和小区ID
     * 2. 任意信息没有则提示缺少对应参数，程序终止
     * @param  {[type]} ctx [description]
     * @return {[type]}     [description]
     */
    checkUserIntegrity(ctx) {
        if (!ctx.user.warehouseId) {
            ctx.throw(400, '缺少参数warehouseId');
            return false;
        }
        if (!ctx.user.communityId) {
            ctx.throw(400, '缺少参数communityId');
            return false;
        }

        return true;
    }

    /**
     * 获取时间戳
     * @return {[type]} [description]
     */
    getTimestamp() {
        return Date.parse(new Date()) / 1000 - 8 * 3600;
    }
}

module.exports = BaseController;

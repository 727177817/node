const MD5 = require("crypto-js/md5");
const Redis = require('../utils/redis.js');
const User = require('../models/user');
const Community = require('../models/community.js');
const BaseController = require('./basecontroller.js');

/**
 * 登录相关接口
 */
class PassportController extends BaseController {
    constructor() {
        super();
    }

    /*
     * 微信快捷登录,包含微信注册流程
     */
    async postWechatLogin(ctx, next) {
        let userinfo = ctx.request.body;
        if (!userinfo.unionId) {
            ctx.throw(400, '缺少参数unionId');
            return
        }
        if (!userinfo.openId) {
            ctx.throw(400, '缺少参数openId');
            return
        }
        let users = await User.getUserInfoWechat(userinfo.unionId);
        if (!users) {
            userinfo.regTime = this.getTimestamp();
            var register = await User.wechatRegister(userinfo)
            users = await User.getUserInfoWechat(userinfo.unionId);
        }
        let timestamp = this.getTimestamp();
        let token = MD5(MD5(userinfo.unionId + 'dota') + timestamp).toString();
        // 未设置小区信息的,不保存小区信息在redis
        if (register === 1) {
            // 签名加密token, 保存
            await Redis.addUser({
                key: token,
                userId: users.user_id
            })
        } else {
            // 获取最近使用的小区信息
            let community = await Community.getOne(users.community_id)
            // 签名加密token, 保存
            if (community) {
                await Redis.addUser({
                    key: token,
                    userId: users.user_id,
                    communityId: users.community_id,
                    warehouseId: community.suppliers_id
                })
            } else {
                await Redis.addUser({
                    key: token,
                    userId: users.user_id
                })
            }
        }
        ctx.body = token;
    }

    async postTestLogin(ctx, next) {
        let obj = await User.getUserInfo(33);

        // 获取最近使用的小区信息
        let community = await Community.getOne(obj.community_id)
        // 签名加密token, 保存
        let timestamp = this.getTimestamp();
        let token = MD5(MD5(obj.unionId + 'dota') + timestamp).toString();
        await Redis.addUser({
            key: token,
            userId: obj.user_id,
            communityId: obj.community_id,
            warehouseId: community.suppliers_id
        })

        ctx.body = token;
    }
}

module.exports = new PassportController();

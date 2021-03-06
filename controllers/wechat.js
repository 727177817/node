const Wechat = require('../models/wechat.js');
const WXBizDataCrypt = require('../utils/WXBizDataCrypt')
const config = require('../config');
const axios = require('axios');
const MD5 = require("crypto-js/md5");
const BaseController = require('./basecontroller.js');

/**
 * 微信登录相关接口
 */
class WechatController extends BaseController {
    constructor() {
        super();
    }

    /*
     * code 换取 session_key
     * @param {String} [code]   登录凭证code
     */

    async getSessionKey(ctx, next) {
        let code = ctx.query.code;
        if (!code) {
            ctx.throw(400, '缺少参数code');
            return;
        }
        // 获取sessionKey
        const result = await axios.get('https://api.weixin.qq.com/sns/jscode2session?appid=' + config.wechat_appid + '&secret=' + config.wechat_appsecret + '&js_code=' + code + '&grant_type=authorization_code');
        let data = {
            open_id: result.data.openid,
            session_key: result.data.session_key,
            session_id: MD5(result.data.session_key).toString()
        }
        let sessionIdArr = await Wechat.selectOpenId(data.open_id);
        // 保存更新第三方session_id
        if (sessionIdArr.length > 0) {
            await Wechat.updataSessionKey(data)
        } else {
            await Wechat.insertSessionKey(data)
        }
        ctx.body = data.session_id
    }

    /*
     * 获取微信用户信息
     * @param {String} [session_id]   第三方session_id
     * @param {String} [encryptedData]   完整用户信息的加密数据
     * @param {String} [iv]   初始向量
     */

    async postUserInfo(ctx, next) {
        let body = ctx.request.body
        let sessionId = body.sessionId;
        let iv = body.iv;
        let encryptedData = body.encryptedData;
        if (!sessionId) {
            ctx.throw(400, '缺少参数sessionId');
            return;
        }
        if (!iv) {
            ctx.throw(400, '缺少参数iv');
            return;
        }
        if (!encryptedData) {
            ctx.throw(400, '缺少参数encryptedData');
            return;
        }
        let sessionKey = await Wechat.selectSessionId(sessionId);
        if (!sessionKey) {
            ctx.throw(501, 'sessionId不存在')
            return;
        }
        let result = this.wechatDecrypt(config.wechat_appid, sessionKey.session_key, encryptedData, iv);
        if (result.watermark) delete result.watermark;
        ctx.body = result
    }



    /*
     * 微信解密方法
     * 微信解密返回值格式
     * openId: "oGZUI0egBJY1zhBYw2KhdUfwVJJE",
     * nickName: "Band",
     * gender: 1,
     * language: "zh_CN",
     * city: "Guangzhou",
     * province: "Guangdong",
     * country: "CN",
     * avatarUrl: "http://wx.qlogo.cn/mmopen/vi_32/aSKcBBPpibyKNicHNTMM0qJVh8Kjgiak2AHWr8MHM4WgMEm7GFhsf8OYrySdbvAMvTsw3mo8ibKicsnfN5pRjl1p8HQ/0",
     * unionId: "ocMvos6NjeKLIBqg5Mr9QjxrP1FA"
     */
    wechatDecrypt(appId, sessionKey, encryptedData, iv) {
        var pc = new WXBizDataCrypt(appId, sessionKey)
        return pc.decryptData(encryptedData, iv)
    }
}

module.exports = new WechatController();

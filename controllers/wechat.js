const Wechat         = require('../models/wechat.js');
const WXBizDataCrypt = require('../utils/WXBizDataCrypt')
const config         = require('../config/config.json');
const axios          = require('axios');
const MD5 = require("crypto-js/md5");


/*
 * code 换取 session_key
 * @param {String} [code]   登录凭证code
 */

exports.getSessionKey = async (ctx, next) => {
    let code = ctx.query.code;
    if(!code){
        ctx.throw(400, '缺少参数code');
        return;
    }
    // 获取sessionKey
    const result = await axios.get('https://api.weixin.qq.com/sns/jscode2session?appid='+config[ctx.app.env].wechat_appid+'&secret='+config[ctx.app.env].wechat_appsecret+'&js_code='+code+'&grant_type=authorization_code');
    let data = {
        open_id: result.data.openid,
        session_key: result.data.session_key,
        session_id: MD5(result.data.session_key).toString()
        // open_id: "omBHq0NB6jpyDvfoq-is6Npb3tJg",
        // session_key: "uQ/SZoW5KkQxwmK3ONK4+A==",
        // session_id: MD5(result.data.session_key).toString()
    }
    let sessionIdArr = await Wechat.selectOpenId(data.open_id);
    // 保存更新第三方session_id
    if(sessionIdArr.length > 0){
        await Wechat.updataSessionKey(data)
    }else{
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

exports.getUserInfo = async (ctx, next) => {
    let sessionId = ctx.query.sessionId;
    let iv = ctx.query.iv;
    let encryptedData = ctx.query.encryptedData;
    if(!sessionId){
        ctx.throw(400, '缺少参数sessionId');
        return;
    }
    if(!iv){
        ctx.throw(400, '缺少参数iv');
        return;
    }
    if(!encryptedData){
        ctx.throw(400, '缺少参数encryptedData');
        return;
    }
    let sessionKey = await Wechat.selectSessionId(sessionId);
    let result = wechatDecrypt(sessionKey.session_key,encryptedData,iv);
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
function wechatDecrypt (sessionKey,encryptedData,iv){
    var appId = 'wx4f4bc4dec97d474b'
    var sessionKey = sessionKey
    var encryptedData = encryptedData
    var iv = iv

    var pc = new WXBizDataCrypt(appId, sessionKey)

    return pc.decryptData(encryptedData , iv)
}
const Wechat         = require('../models/wechat.js');
const WXBizDataCrypt = require('../utils/WXBizDataCrypt')
const config         = require('../config/config.json');
const axios          = require('axios');
const MD5 = require("crypto-js/md5");

/*
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
exports.wechatDecrypt = (sessionKey,encryptedData,iv) => {
    var appId = 'wx4f4bc4dec97d474b'
    var sessionKey = sessionKey
    var encryptedData = encryptedData
    var iv = iv

    var pc = new WXBizDataCrypt(appId, sessionKey)

    return pc.decryptData(encryptedData , iv)
}


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
    if(sessionIdArr.length > 0){
        await Wechat.updataSessionKey(data)
    }else{
        await Wechat.insertSessionKey(data)
    }
    ctx.body = data.session_id 
}

/*
 * 根据第三方 session_id 获取session_key
 * @param {String} [session_id]   第三方session_id
 */

exports.getUserInfo = async (ctx, next) => {
    let session_id = ctx.query.session_id;
    let iv = ctx.query.iv;
    let encryptedData = ctx.query.encryptedData;
    if(!session_id){
        ctx.throw(400, '缺少参数session_id');
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
    let sessionKey = await Wechat.selectSessionId(session_id);
    let result = wechatDecrypt(sessionKey.session_key,encryptedData,iv);
    ctx.body = result 
}


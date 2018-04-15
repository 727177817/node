/**
 * redis 操作工具
 */
const Redis = require('ioredis'),
    config = require('../config/config.json');

var client = null;

/**
 * 连接redis服务
 * @return {[type]}
 */
function start() {
    client = new Redis(6379);

    client.on('error', async(err, result) => {
        console.log('连接redis错误', err);
    });
    client.on('connect', async() => {
        console.log('连接redis服务成功');
    });
}



/**
 * 缓存用户信息
 * @param {[type]} params 用户信息
 */
async function addUser(params) {
    if (params) {
        await client.hmset(params.key, 'userId', params.userId, 'communityId', params.communityId, 'suppliersId', params.suppliersId);
        await client.expire(params.key, 2592000);
    }
}


/**
 * 获取缓存的用户信息
 * @param  {[type]} token 用户id
 * @return {[type]}        用户信息
 */
async function getUser(params) {
    let user
    if (params.field) {
        user = await client.hget(params.key, params.field);
    }else{
        user = await client.hgetall(params.key);
    }
    if(user == null) return null;
    return user;
};


module.exports = {
    start,
    addUser,
    getUser
}
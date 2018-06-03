/**
 * redis 操作工具
 */
const Redis = require('ioredis'),
    config = require('../config');

var client = null;

/**
 * 连接redis服务
 * @return {[type]}
 */
function start() {
    client = new Redis(config.redis);

    client.on('error', async(err, result) => {
        console.log('连接redis错误', err);
    });
    client.on('connect', async() => {
        console.log('连接redis服务成功');
    });
}



/**
 * 缓存/更新用户信息
 * @param {[type]} params 用户信息
 */
async function addUser(params) {
    if (params) {
        await client.hmset(params.key, 'userId', params.userId);
        await client.hmset(params.userId, 'communityId', params.communityId, 'warehouseId', params.warehouseId);
        await client.expire(params.key, 2592000);
    }
}


/**
 * 获取缓存的用户信息
 * @param  {[type]} token 用户id
 * @return {[type]}        用户信息
 */
async function getUser(params) {
    let user;

    let tokenObj = await client.hgetall(params.key);
    if (!tokenObj) {
        return null;
    }
    user = { ...tokenObj };

    let userInfo = await client.hgetall(user.userId);
    if (userInfo) {
        user = { ...user, ...userInfo };
    }

    if (Object.keys(user).length == 0) return null;
    
    return user;
};


module.exports = {
    start,
    addUser,
    getUser
}

const Redis = require('../utils/redis.js');
const Community = require('../models/community.js');
const User = require('../models/user.js');
const Cart = require('../models/cart.js');
const BaseController = require('./basecontroller.js');

/**
 * 通用相关接口
 */
class CommonController extends BaseController {
    constructor() {
        super();
    }


    /**
     * 测试用
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    async getTest(ctx, next) {

        ctx.session = {
            userId: 28,
            warehouseId: 1,
            communityId: 1
        }

        ctx.body = ctx.session;
    }

    /**
     * 获取所有小区信息
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    async getCommunities(ctx, next) {

        let result = await Community.getList();

        ctx.body = result;
    }


    /**
     * 设置当前用户选择的小区
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    async postCommunity(ctx, next) {
        // let token = ctx.request.header.token
        // let userId = await Redis.getUser({
        //     key: token,
        //     field: 'userId'
        // })
        // if (!userId) {
        //     ctx.throw(401);
        //     return;
        // }

        let body = ctx.request.body;
        let token = ctx.request.header.token;
        let user = ctx.user;
        if (!body.communityId) {
            ctx.throw(400, '缺少参数communityId');
            return;
        }

        let community = await Community.getOne(body.communityId);
        if (!community) {
            throw (400, '选择的小区信息不存在');
            return;
        }
        let res = await User.update(user.userId, {
            community_id: body.communityId
        });

        if (res > 0) {
            await Redis.addUser({
                key: token,
                userId: user.userId,
                communityId: body.communityId,
                warehouseId: community.suppliers_id
            })
            ctx.body = res;
        } else {
            ctx.throw(500, '设置失败');
        }
    }

    /**
     * 获取所有购物车数量
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    async getCartCount(ctx, next) {
        // let token = ctx.request.header.token
        // let user = await Redis.getUser({
        //     key: token
        // })
        // if (!user.userId) {
        //     ctx.throw(401);
        //     return;
        // }

        // if (!user.warehouseId) {
        //     ctx.throw(400, '缺少参数warehouseId');
        //     return;
        // }

        if (!this.checkUserIntegrity(ctx)) {
            return;
        }

        let user = ctx.user;
        let result = await Cart.getCountByUserIdAndWarehouseId(user.userId, user.warehouseId);

        ctx.body = result;
    }
}

module.exports = new CommonController();

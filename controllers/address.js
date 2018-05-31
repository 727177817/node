const Redis = require('../utils/redis.js');
const Address = require('../models/address.js');
const Community = require('../models/community.js');
const BaseController = require('./basecontroller.js');

/**
 * 收货地址相关接口
 */
class AddressController extends BaseController {
    constructor() {
        super();
    }

    /*
     * 添加收货地址
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     * @param {[type]}   consignee     [收货人]
     * @return {[type]}   address     [新增地址]
     */
    async postAdd(ctx, next) {
        if (!this.checkUserIntegrity(ctx)) {
            return;
        }

        let body = ctx.request.body;
        if (!body.consignee) {
            ctx.throw(400, '缺少参数consignee');
            return;
        }

        if (!body.mobile) {
            ctx.throw(400, '缺少参数mobile');
            return;
        }

        if (!body.address) {
            ctx.throw(400, '缺少参数address');
            return;
        }

        let address = '', user = ctx.user;
        // 如果addressId存在，更新收货地址
        if (body.addressId) {
            // 更新收货地址
            let data = {
                user_id: user.userId,
                community_id: user.communityId,
                consignee: body.consignee,
                mobile: body.mobile,
                address: body.address
            }
            await Address.update(body.addressId, data)
            address = await Address.getOneWithUserId(user.userId, body.addressId)
        } else {
            // 新增收货地址
            let data = {
                user_id: user.userId,
                community_id: user.communityId,
                consignee: body.consignee,
                mobile: body.mobile,
                address: body.address
            }
            let lastId = await Address.insert(data)
            address = await Address.getOneWithUserId(user.userId, lastId)
        }

        ctx.body = address;
    }

    /*
     * 删除用户地址
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     * @return {[type]}   list     [地址列表]
     */
    async getRemove(ctx, next) {
        let id = ctx.query.id;
        if (!id) {
            ctx.throw(400, '缺少参数addressId');
            return;
        }

        await Address.removeWithUserId(ctx.user.userId, id)
        ctx.body = id;
    }

    /*
     * 获取用户地址列表
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     * @return {[type]}   list     [地址列表]
     */
    async getList(ctx, next) {
        let list = await Address.getAllByUserId(ctx.user.userId)
        let assignList = []
        for (var i = 0; i < list.length; i++) {
            let community = await Community.getOne(list[i].community_id)
            assignList.push(Object.assign(list[i],community))
        }
        ctx.body = assignList;
        ctx.body = list;
    }


    /*
     * 获取地址详情
     * @param  {[type]}   ctx  [description]
     * @param  {Function} next [description]
     * @param {[type]}   id     [地址Id]
     * @return {[type]}   detail     [地址详情]
     */
    async getDetail(ctx, next) {
        let id = ctx.query.id;
        if (!id) {
            ctx.throw(400, '缺少参数addressId');
            return;
        }

        let detail = await Address.getOneWithUserId(ctx.user.userId, id)
        ctx.body = detail;
    }
}

module.exports = new AddressController();

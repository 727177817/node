const Model = require('../models/model');

class Ads extends Model {

    constructor() {
        super();
    }

    async banner(communityId) {
        var banner = await this.db
            .select().from('ecs_ad').where({
                community_id: communityId
            })
        return banner
    }

    /**
     * 根据广告位置和仓库获取可用的广告
     * 1. 启用状态
     * 2. 生效期之内
     * @param  {[type]} positionId  [description]
     * @param  {[type]} warehouseId [description]
     * @return {[type]}             [description]
     */
    async getAvaliableWithPositionAndWarehouse(positionId, warehouseId, timestamp) {
        return await this.db
            .select().from('ecs_ad')
            .where({
                position_id: positionId,
                warehouse_id: warehouseId,
                enabled: 1,
            })
            .andWhere('start_time', '<', timestamp)
            .andWhere('end_time', '>', timestamp)
            .orderBy('ad_id', 'desc')
    }


}
module.exports = new Ads();

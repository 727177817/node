const Ad = require('../models/ad.js');
const Category = require('../models/category.js');
const Goods = require('../models/goods.js');
const Community = require('../models/community.js');
const Article = require('../models/article.js');
const BaseController = require('./basecontroller.js');
const config = require('../config');

/**
 * 首页相关接口
 */
class HomeController extends BaseController {
    constructor() {
        super();
    }

    /*
     * 获取首页广告位
     */
    async getHome(ctx, next) {

        let user = ctx.user;
        let timestamp = this.getTimestamp();

        // 获取最近使用的小区信息
        let community = await Community.getOne(user.communityId)
        // banner广告
        let ads = [];
        if(user.warehouseId){
            ads = await Ad.getAvaliableWithPositionAndWarehouse(config.HOME_AD_POSITION, user.warehouseId, timestamp)
        }
        // 热销商品
        let hotGoods = await Goods.hotGoods(user.warehouseId);
        
        // 获取首页商品分类
        let category = await Category.getCategoryForHome();
        // 获取分类商品
        let categoryGoodsList = await Goods.homeCategoryGoods(user.warehouseId)
        for (let i = 0; i < category.length; i++) {
            let categoryGoods = [];
            for (let j = 0; j < categoryGoodsList.length; j++) {
                if (category[i].cat_id == categoryGoodsList[j].cat_id) {
                    categoryGoods.push(categoryGoodsList[j])
                }
            }
            Object.assign(category[i], { goods: categoryGoods })
        }

        //公告信息，首页分类固定为14
        let notices = await Article.getArticlesForHome(user.communityId, config.HOME_NOTICE_TYPE_ID);

        ctx.body = {
            ads,
            category,
            hotGoods,
            community,
            notices
        };
    }
}

module.exports = new HomeController();

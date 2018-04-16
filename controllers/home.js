const Redis     = require('../utils/redis.js');
const Ad        = require('../models/ad.js');
const Category  = require('../models/category.js');
const Goods     = require('../models/goods.js');
const Community = require('../models/community.js');
const Article = require('../models/article.js');

 /*
 * 获取首页广告位
 */ 
exports.getHome = async(ctx, next) => {
	let token = ctx.request.header.token
	let user = await Redis.getUser({
		key: token
	})
	if(!user){
        ctx.throw(400, '缺少参数token');
        return;
    }

    // 获取最近使用的小区信息
	let community = await Community.getOne(user.communityId)
	// banner广告
	let ads = await Ad.banner(user.communityId)
	// 热销商品
	let hotGoods = await Goods.hotGoods(user.warehouseId)
	// 获取首页商品分类
	let category  = await Category.homeAds(user.warehouseId)
	// 获取分类商品
	let categoryGoodsList = await Goods.homeCategoryGoods(user.warehouseId)
	for (let i = 0; i < category.length; i++) {
		let categoryGoods = [];
		for (let j = 0; j < categoryGoodsList.length; j++) {			
			if(category[i].cat_id == categoryGoodsList[j].cat_id){
				categoryGoods.push(categoryGoodsList[j])
			}
		}
		Object.assign(category[i],{goods: categoryGoods})
	}

	//公告信息，首页分类固定为14
	let notices = await Article.getArticlesForHome(user.communityId, 14);
	
    ctx.body = {
    	ads,
    	category,
    	hotGoods,
    	community,
    	notices
    };
}
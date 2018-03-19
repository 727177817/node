const Ad       = require('../models/ad.js');
const Category = require('../models/category.js');
const Goods    = require('../models/goods.js');

 /*
 * 获取首页广告位
 */ 
exports.getHome = async(ctx, next) => {
	ctx.session.suppliersId;
	// banner广告
	let ads       = await Ad.banner()
	// 热销商品
	let goodsList = await Goods.homeGoods()
	// 获取首页商品分类
	let category  = await Category.homeAds()
	// 获取分类商品
	let categoryGoodsList = await Goods.homeCategoryGoods()
	for (let i = 0; i < category.length; i++) {
		let categoryGoods = [];
		for (let j = 0; j < categoryGoodsList.length; j++) {			
			if(category[i].cat_id == categoryGoodsList[j].cat_id){
				categoryGoods.push(categoryGoodsList[j])
			}
		}
		Object.assign(category[i],{goods: categoryGoods})
	}
	
    ctx.body = {
    	ads: ads,
    	category: category,
    	goodsList: goodsList
    };
}
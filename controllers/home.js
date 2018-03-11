const Ad       = require('../models/ad.js');
const Category = require('../models/category.js');
const Goods    = require('../models/goods.js');

 /*
 * 获取首页广告位
 */ 
exports.getHome = async(ctx, next) => {
	console.log("ads")
	// let ads = await Ad.banner()
	// let category = await Category.category()

	// let categoryGoodsList = await Goods.list()
    ctx.body = {
    	data: "1"
    }
    // 	// categoryGoodsList: categoryGoodsList,
    // 	ads: ads,
    // 	// category: category
    // };
}
const Category = require('../models/category.js');
const Goods    = require('../models/goods.js');

 /*
 * 获取分类
 */ 
exports.getCategory = async(ctx, next) => {
	// 获取首页商品分类
	let category  = await Category.category()
	// 获取分类商品
	let goodsList = await Goods.list()
	for (let i = 0; i < category.length; i++) {
		let categoryGoods = [];
		for (let j = 0; j < goodsList.length; j++) {			
			if(category[i].cat_id == goodsList[j].cat_id){
				categoryGoods.push(goodsList[j])
			}
		}
		Object.assign(category[i],{goods: categoryGoods})
	}
	
    ctx.body = {
    	category: category
    };
}
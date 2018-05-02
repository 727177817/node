const Redis    = require('../utils/redis.js');
const Category = require('../models/category.js');
const Goods    = require('../models/goods.js');

 /*
 * 获取所有分类和分类商品
 */ 
exports.getCategory = async(ctx, next) => {
	let token = ctx.request.header.token
	let warehouseId = await Redis.getUser({
		key: token,
		field: 'warehouseId'
	})
	if(!warehouseId){
        ctx.throw(400, '缺少参数warehouseId');
        return;
    }
    
	// 获取首页商品分类
	let category  = await Category.category()
	// 获取分类商品
	let goodsList = await Goods.list(warehouseId)
	for (let i = 0; i < category.length; i++) {
		let categoryGoods = [];
		for (let j = 0; j < goodsList.length; j++) {			
			if(category[i].cat_id == goodsList[j].cat_id){
				categoryGoods.push(goodsList[j])
			}
		}
		Object.assign(category[i],{goods: categoryGoods})
	}
    ctx.body = category
}
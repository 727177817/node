const Goods = require('../models/goods.js');

// exports.getList =  (ctx, next) => {
//     try {
//         let list = Goods.getList();
//         return list;
//     } catch (err) {
//         return err;
//     }
// }


exports.detail = async (ctx, next) => {
    try {
	  	ctx.body = await Goods.getList();
        // let list = await Goods.getList;
    } catch (err) {
        return 'err';
    }
}
const Goods = require('../models/goods.js');

exports.getList = async (ctx, next) => {
    try {
        let list = await Goods.getList();
        return list;
    } catch (err) {
        return err;
    }
}


exports.getDetail = async (ctx, next) => {
    try {
        return 'success';
        // let list = await Goods.getList;
    } catch (err) {
        return 'err';
    }
}
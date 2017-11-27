const Model = require('./model.js');


class Goods extends Model {

    constructor(app) {
        super(app);
    }

    async getList() {
        let list = await app.db
		   .select('goods_id')
		   .from('ecs_goods');

        return list;
    }


}


module.exports = function(app) {
    return new Goods(app);
}
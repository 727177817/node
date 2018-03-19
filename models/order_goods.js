const Model = require('../models/model');

class OrderGoods extends Model {

    constructor() {
        super();
        this.name = 'ecs_order_goods'
    }

}
module.exports = new OrderGoods();


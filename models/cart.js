const Model = require('../models/model');

class Cart extends Model {

    constructor() {
        super();

        this.name = 'ecs_cart';
    }

    async getOne() {
        let obj = this.db(this.name).where({
            session_id: '',
            goods_id: '$goods_id',
            parent_id: 0,
            goods_attr: ' .get_goods_attr_info($spec)',
            extension_code: 'package_buy',
            rec_type: 'CART_GENERAL_GOODS'
        }).select('goods_number')

        //"SELECT goods_number FROM " .$GLOBALS['ecs']->table('cart').
        //" WHERE session_id = '" .SESS_ID. "' AND goods_id = '$goods_id' ".
        //" AND parent_id = 0 AND goods_attr = '" .get_goods_attr_info($spec). "' " .
        //" AND extension_code <> 'package_buy' " .
        //" AND rec_type = 'CART_GENERAL_GOODS'";

        // knex('books').insert({title: 'Slaughterhouse Five'})
        return obj
    }

    async insert(data){
        return this.db(this.name).insert(data);
    }

    async update(data){
        return this.db(this.name).where({
            session_id: '',
            goods_id: '$goods_id',
            parent_id: 0,
            goods_attr: ' .get_goods_attr_info($spec)',
            extension_code: 'package_buy',
            rec_type: 'CART_GENERAL_GOODS'
        }).update(data);
    }

    async getAll() {
        var detail = await this.db
            .select().from(this.name).where('goods_id', goods_id);
        return detail
    }

}
module.exports = new Cart();

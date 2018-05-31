const Model = require('../models/model');

class OrderAction extends Model {

    constructor() {
        super();
        this.name = 'ecs_order_action'
    }

    /**
     * 记录订单操作日志
     * @param  {[type]} orderId        [description]
     * @param  {[type]} actionUser     [description]
     * @param  {[type]} orderStatus    [description]
     * @param  {[type]} shippingStatus [description]
     * @param  {[type]} payStatus      [description]
     * @param  {[type]} actionNote     [description]
     * @param  {[type]} logTime        [description]
     * @return {[type]}                [description]
     */
    async record(orderId, actionUser, orderStatus, shippingStatus, payStatus, actionNote, logTime) {
        return await this.db(this.name)
            .insert({
                order_id: orderId,
                action_user: actionUser,
                order_status: orderStatus,
                shipping_status: shippingStatus,
                pay_status: payStatus,
                action_place: 0,
                action_note: actionNote,
                log_time: logTime
            });
    }

    // $sql = 'INSERT INTO ' . $GLOBALS['ecs']->table('order_action') .
    //             ' (order_id, action_user, order_status, shipping_status, pay_status, action_place, action_note, log_time) ' .
    //         'SELECT ' .
    //             "order_id, '$username', '$order_status', '$shipping_status', '$pay_status', '$place', '$note', '" .gmtime() . "' " .
    //         'FROM ' . $GLOBALS['ecs']->table('order_info') . " WHERE order_sn = '$order_sn'";
}
module.exports = new OrderAction();

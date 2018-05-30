const Model = require('../models/model');

class PayLog extends Model {

    constructor() {
        super();
        this.name = 'ecs_pay_log'
    }
    
}
module.exports = new PayLog();


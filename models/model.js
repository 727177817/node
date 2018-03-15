const config = require('../config/config.json');
const knex   = require('knex');
class Model {

    constructor() {
        this.db = knex({client: 'mysql', connection: config["production"].database});
    }

}

module.exports = Model;

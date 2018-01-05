const config = require('../config/db_config.json');
const knex   = require('knex');
class Model {

    constructor() {
        this.db = knex({client: 'mysql', connection: config["development"].database});
    }

}

module.exports = Model;

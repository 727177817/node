const config = require('../config.json');
const knex   = require('knex');
class Model {

    constructor() {
        // this.memcache    = app.memcache;
        // this.mysql       = app.mysql;
        this.db = knex({client: 'mysql', connection: config["development"].database});
    }

}

module.exports = Model;

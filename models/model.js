const config = require('./config.json');
const knex   = require('knex');
class Model {

    constructor() {
        // this.memcache    = app.memcache;
        // this.mysql       = app.mysql;

		// connect mysql
		return knex({client: 'mysql', connection: config[app.env].database});
		// connect mysql
		// app.use(async (ctx, next) => {
		// 	app.db = knex({client: 'mysql', connection: config[app.env].database});
		// 	await next();
		// });
    }

}

module.exports = Model;

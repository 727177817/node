const config = require('../config.json');
const knex   = require('knex');
class Model {

    constructor() {
        // this.memcache    = app.memcache;
        // this.mysql       = app.mysql;
        this.db = async ()=>{
            knex({client: 'mysql', connection: config[app.env].database}).select('goods_id').from('ecs_goods');
            await next();
        }
        // this.db = await knex({client: 'mysql', connection: config[app.env].database});
        // await next();
    }

}

class Goods extends Model {

    constructor() {
        super();
    }

    getList() {
     //    let list =  super.db
		   // ;
        return super.db;
    }


}


// module.exports = (app)=>{
// 	new Goods(app)
// } 

module.exports = new Goods();


const config = require('../config/config.json');
const knex   = require('knex');
class Model {

    constructor() {
        this.db = knex({client: 'mysql', connection: config["production"].database});
    }
    
    async insert(data){
        return await this.db(this.name).insert(data);
    }

    async update(condition, data){
        return this.db(this.name).where(condition).update(data);
    }

    async remove(condition){
        return await this.db(this.name).where(condition).delete();
    }

}

module.exports = Model;

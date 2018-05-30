const config = require('../config');
const knex   = require('knex');
class Model {

    constructor() {
        this.db = knex({client: 'mysql', connection: config.database});
    }

    /**
     * 获取分页大小，默认10
     * @param  {[type]} size [description]
     * @return {[type]}      [description]
     */
    getSize(size){
        return size > 0 ? size : 10;
    }

    /**
     * 获取页码，从0开始
     * @param  {[type]} page [description]
     * @return {[type]}      [description]
     */
    getPage(page){
        return page > 0 ? page : 0;
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

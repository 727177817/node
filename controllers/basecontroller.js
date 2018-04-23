const Redis    = require('../utils/redis.js');

class BaseController{
	constructor(){

		this.redis = Redis;
	}
}

module.exports = BaseController;
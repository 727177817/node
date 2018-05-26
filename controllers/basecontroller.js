const Redis    = require('../utils/redis.js');

class BaseController{
	constructor(){
		this.redis = Redis;
		this.isAbc = true;
	}
}

module.exports = BaseController;
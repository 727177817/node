const routers = require('koa-router')();
const controller = require('../controllers/passport');
	
Object.keys(controller).map(key => {
	routers.get('/' + key, controller[key])
})

module.exports = routers;
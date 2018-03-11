const router = require('koa-router')();
const controller = require('../controllers/cart');
const routers = router
	.get('/add', controller.add)
	.get('/remove', controller.remove)
	.get('/change', controller.change)

module.exports = routers;
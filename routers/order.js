const router = require('koa-router')();
const controller = require('../controllers/order');

const routers = router
	.get('/list', controller.list)
	.get('/detail', controller.detail)

module.exports = routers;
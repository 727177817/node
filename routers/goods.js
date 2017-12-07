const router = require('koa-router')();
const controller = require('../controllers/goods');

const routers = router
	.get('/list',controller.list)
	.get('/detail',controller.detail)

module.exports = routers;
const router = require('koa-router')();
const controller = require('../controllers/goods');

const routers = router
	.get('/list',controller.list);

module.exports = routers;
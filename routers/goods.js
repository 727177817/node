const router = require('koa-router')();
const controller = require('../controllers/goods');

const routers = router
	.get('/detail',controller.detail);

module.exports = routers;
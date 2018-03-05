const router = require('koa-router')();
const controller = require('../controllers/passport');
const routers = router
	.get('/wechat_login', controller.wechatLogin)
	.get('/set', controller.setSession)

module.exports = routers;
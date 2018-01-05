const router = require('koa-router')();
const goods = require('./goods');
const order = require('./order');

router.use('/goods', goods.routes(), goods.allowedMethods());
router.use('/order', order.routes(), order.allowedMethods());

module.exports = router;
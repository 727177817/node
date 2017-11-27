const router = require('koa-router')();
const goods = require('./goods');

router.use('/goods', goods.routes(), goods.allowedMethods());

module.exports = router;
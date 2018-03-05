const router = require('koa-router')();
const goods = require('./goods');
const order = require('./order');
const passport = require('./passport');

router.use('/goods', goods.routes(), goods.allowedMethods());
router.use('/order', order.routes(), order.allowedMethods());
router.use('/passport', passport.routes(), passport.allowedMethods());

module.exports = router;
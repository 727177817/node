const router = require('koa-router')();
const goods = require('../controllers/goods.js');

router.get('/',async function (ctx, next) {
  ctx.body = 'this a users response!';
});

router.get('/goods', async(ctx, next) => {
    let reqBody = ctx.request;
    ctx.body = goods.getList();
});

module.exports = router;
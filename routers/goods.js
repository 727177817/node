// const router = require('koa-router')();
// const Goods = require('../controllers/goods.js');

// router.get('/',async function (ctx, next) {
//   ctx.body = 'this a users response!';
// });

// router.get('/goods', async(ctx, next) => {
//     let reqBody = ctx.request;
//     ctx.body = Goods.getList(app);
// });

// module.exports = router;



const router = require('koa-router')();
const controller = require('../controllers/goods');

const routers = router
	.get('/detail',controller.detail);

module.exports = routers;
const Koa    = require('koa');
const app    = new Koa();

const knex   = require('knex');
// const memcache   = require('memcache');

const config = require('./config.json');
const router  = require('./routes/goods.js');


// connect mysql
app.use(async (ctx, next) => {
	app.db = knex({client: 'mysql', connection: config[app.env].database});   
	await next();
});


// app.use(async (ctx, next) => {
// 	let list = await app.db.select('*').from('ecs_goods');
// 	ctx.body = list[0]
// });


app.use(router.routes(), router.allowedMethods());

// connect memcache
// app.use(async (ctx, next) => {
// 	app.memcache = new memcache(config[req.env].memcache);
// 	next();
// });


app.listen(3000, () => {
    process.stdout.write('[static] server started at :3000\r\n');
});


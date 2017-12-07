const Koa    = require('koa');
const app    = new Koa();

// const memcache   = require('memcache');

const routers  = require('./routers/index');


app.use(routers.routes(), routers.allowedMethods());


app.listen(3009, () => {
    process.stdout.write('[static] server started at :3000\r\n');
});


const Koa = require('koa');
const app = new Koa();
const koaBody = require('koa-body');
const bodyParser = require('koa-bodyparser');
const xmlParser = require('koa-xml-body');

const config = require('./config');
const routers = require('./routers');
const logUtil = require('./utils/log_util');
const redis = require('./utils/redis.js');
// const ApiError        = require('./error/ApiError');
const auth = require('./middlewares/auth');
const response_formatter = require('./middlewares/response_formatter');

// app.env = 'PRODUCTION';

// x-response-time
app.use(async(ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});

// logger
app.use(async(ctx, next) => {
    //响应开始时间
    const start = new Date();
    //响应间隔时间
    var ms;
    try {
        //开始进入到下一个中间件
        await next();

        ms = new Date() - start;
        //记录响应日志
        logUtil.logResponse(ctx, ms);

    } catch (error) {

        ms = new Date() - start;
        //记录异常日志
        logUtil.logError(ctx, error, ms);
    }
});

/**
 * 连接Redis服务
 */
redis.start();

// app.use(koaBody());
// 要先解析xml在解析body
app.use(xmlParser());
app.use(bodyParser());
// 认证拦截器
app.use(auth);
// 响应拦截器
app.use(response_formatter);
//路由定义应该在中间件之后
app.use(routers.routes(), routers.allowedMethods());
// app.use(router.allowedMethods({
//   throw: true,
//   notImplemented: () => new Boom.notImplemented(),
//   methodNotAllowed: () => new Boom.methodNotAllowed()
// }));

app.listen(3000, () => {
    process.stdout.write('[static] server started at :3000\r\n');
});

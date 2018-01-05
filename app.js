const Koa = require('koa');
const app = new Koa();

// const memcache   = require('memcache');

const routers = require('./routers/index');
const logUtil = require('./utils/log_util');
// const ApiError = require('./error/ApiError');
const response_formatter = require('./middlewares/response_formatter');

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

app.use(response_formatter);

app.use(routers.routes(), routers.allowedMethods());


app.listen(3000, () => {
    process.stdout.write('[static] server started at :3000\r\n');
});
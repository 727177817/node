const Koa = require('koa');
const app = new Koa();

// 将session存放在MySQL数据库中
const session = require('koa-session-minimal');
const mysqlSession = require('koa-mysql-session');
const koaBody = require('koa-body');

const routers = require('./routers/index');
const logUtil = require('./utils/log_util');
// const ApiError = require('./error/ApiError');
const response_formatter = require('./middlewares/response_formatter');
const config = require('./config/db_config.json');

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

app.use(koaBody());
app.use(response_formatter);

// 配置存储session信息的mysql
let store = new mysqlSession(config["production"].database)

// 使用session中间件
app.use(session({
    key: 'session_id',
    store: store,
}));

//路由定义应该在中间件之后
app.use(routers.routes(), routers.allowedMethods());

app.listen(3000, () => {
    process.stdout.write('[static] server started at :3000\r\n');
});
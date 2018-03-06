const Koa = require('koa');
const app = new Koa();

// 将session存放在MySQL数据库中
const session = require('koa-session-minimal');
const mysqlSession = require('koa-mysql-session');


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

app.use(response_formatter);

// 配置存储session信息的mysql
let store = new mysqlSession(config["production"].database)

// 存放sessionId的cookie配置
let cookie = {
  maxAge: '', // cookie有效时长
  expires: '',  // cookie失效时间
  path: '', // 写cookie所在的路径
  domain: '', // 写cookie所在的域名
  httpOnly: '', // 是否只用于http请求中获取
  overwrite: '',  // 是否允许重写
  secure: '',
  sameSite: '',
  signed: ''
}

// 使用session中间件
app.use(session({
  key: 'session_id',
  store: store,
  cookie: cookie
}));

//路由定义应该在中间件之后
app.use(routers.routes(), routers.allowedMethods());

app.listen(3000, () => {
    process.stdout.write('[static] server started at :3000\r\n');
});
/**
 * 在app.use(router)之前调用
 */
var response_formatter = async(ctx, next) => {

    let res = ctx.response;
    let body = {
        code: 400,
        message: ''
    };

    try {
        //先去执行路由
        await next();
    } catch (err) {
        //处理通用错误
        switch (err.status) {
            case 400:
                {
                    body = {
                        code: err.status,
                        message: err.message
                    }
                    break;
                }
            case 401:
                {
                    body = {
                        code: err.status,
                        message: 'Access Denied'
                    }
                    break;
                }
            case 500:
                {
                    body = {
                        code: err.status,
                        message: err.message
                    }
                    break;
                }
            default:
                {
                    if(ctx.app.env === 'development'){
                        //开发环境输出更多的错误信息
                        console.log(err);
                    }
                    body = {
                        code: 500,
                        message: err.message
                    }
                    break;
                }
        }
    }

    if (ctx.body) {
        //如果有返回数据，将返回数据添加到data中
        body = {
            code: 200,
            message: 'success',
            data: ctx.body
        }
    }

    ctx.body = body;
}

module.exports = response_formatter;

const router = require('koa-router')();
const goods = require('./goods');
const order = require('./order');
const passport = require('./passport');
const cart = require('./cart');

router.use('/goods', goods.routes(), goods.allowedMethods());
router.use('/order', order.routes(), order.allowedMethods());
router.use('/passport', passport.routes(), passport.allowedMethods());
router.use('/cart', cart.routes(), cart.allowedMethods());

// 查看登录信息
router.get('/abc', ctx => {
    // 查看 session 中是否有用户登录信息
    if (ctx.session.user) {
        ctx.body = {
            status: '您已登录',
            session: ctx.session.user
        }    
    } else {
        ctx.body = '未登录';
    }
})
.get('/abd', ctx => {
    ctx.session.user = {
        username: 'test',
        password: '123'
    }
    ctx.body = '登陆成功，请访问 GET / 查看session中的信息'
})

module.exports = router;
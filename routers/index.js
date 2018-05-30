/**
 * 该文件系自动生成，手动修改可能会被替换
 * 可以通过node generate-router.js自动生成
 */
const router = require('koa-router');
const mainRouter = router();
let allCtls = [];

allCtls.push({
	path: 'address',
	ctl: require('../controllers/address')
});

allCtls.push({
    path: 'article',
    ctl: require('../controllers/article')
});

allCtls.push({
    path: 'basecontroller',
    ctl: require('../controllers/basecontroller')
});

allCtls.push({
    path: 'cart',
    ctl: require('../controllers/cart')
});

allCtls.push({
    path: 'category',
    ctl: require('../controllers/category')
});

allCtls.push({
    path: 'commit',
    ctl: require('../controllers/commit')
});

allCtls.push({
    path: 'common',
    ctl: require('../controllers/common')
});

allCtls.push({
    path: 'coupon',
    ctl: require('../controllers/coupon')
});

allCtls.push({
    path: 'goods',
    ctl: require('../controllers/goods')
});

allCtls.push({
    path: 'home',
    ctl: require('../controllers/home')
});

allCtls.push({
    path: 'order',
    ctl: require('../controllers/order')
});

allCtls.push({
    path: 'passport',
    ctl: require('../controllers/passport')
});

allCtls.push({
    path: 'wechat',
    ctl: require('../controllers/wechat')
});


processCtls(mainRouter, allCtls);

// console.log(mainRouter)

function processCtls(r, ctls) {
    if (!ctls) {
        return;
    }

    ctls.map((item, i) => {
        processRouter(r, item.path, item.ctl);
    });
}

function processRouter(r, path, ctl) {
	let arr = Object.keys(ctl);
    let isAbc = arr.indexOf('isAbc') != -1;
 	if(isAbc){
 		arr = Object.getOwnPropertyNames(Object.getPrototypeOf(ctl));
 	}
	// console.log(typeof ctl.constructor, path, arr);

    arr.map(key => {
    	if(key == 'constructor' || typeof ctl[key] != 'function'){
    		// console.log(key + ' is not function');
     		return;
     	}

        let justDoing = ctl[key];
        if(isAbc){
            justDoing = ctl[key].bind(ctl);
        }

        if (key.indexOf('post') == 0) {
            let action = key.substring(4);
            r.post('/' + path + '/' + action.toLowerCase(), justDoing)
        } else if (key.indexOf('get') == 0) {
            let action = key.substring(3);
            r.get('/' + path + '/' + action.toLowerCase(), justDoing)
        } else {
            r.get('/' + path + '/' + key.toLowerCase(), justDoing)
        }
    });
}
module.exports = mainRouter;
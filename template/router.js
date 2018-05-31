/**
 * 该文件系自动生成，手动修改可能会被替换
 * 可以通过node generate-router.js自动生成
 */
const router = require('koa-router');
const mainRouter = router();
let allCtls = [];

[ALLROUTER]
processCtls(mainRouter, allCtls);

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

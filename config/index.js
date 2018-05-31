const config = require('./config.json');
const constant = require('./constant.js');
const routerConfig = require('./router_config.js');

let environment = 'production';
try {
    let NODE_ENV = process.env.NODE_ENV;
    NODE_ENV = NODE_ENV.trim();
    if(NODE_ENV){
    	environment = NODE_ENV;
    }
} catch (err) {

}

module.exports = Object.assign(config[environment], constant, routerConfig);

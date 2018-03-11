/**
 * 功能：自动创建新的模块
 * 命令：node create-module.js xx xx
 * 实现：读取template下的模版文件生成到对应的目录
 * 
 */
const fs = require('fs');
const baseCtlDir = './controllers';
const baseTempDir = './template';
const baseRouterDir = './routers';
const folderSep = '/';

try {
    const ctls = fs.readdirSync(baseCtlDir);
    let allRouter = '';
    ctls.map(function(item, i) {
        if(item.indexOf('.') != -1){
            item = item.split('.')[0]
        }
        allRouter += genSubRouter(item);
        allRouter += '\r\n\r\n';
    })
    genRouterFile(allRouter);
} catch (ex) {
    console.log(ex);
}

function genSubRouter(fileName, sourcePath, targetPath) {
    var fileContent = fs.readFileSync(baseTempDir + folderSep + 'router-sub.js', 'utf8');
    fileContent = fileContent.replace(/\[MODULE\]/g, fileName);
    return fileContent;
}

function genRouterFile(allRouter){
    var fileContent = fs.readFileSync(baseTempDir + folderSep + 'router.js', 'utf8');
    fileContent = fileContent.replace(/\[ALLROUTER\]/g, allRouter);
    fs.writeFileSync(baseRouterDir + folderSep + 'index.js', fileContent, 'utf8');   
}

function getRouterPath(folderName, moduleName) {
    if (folderName == moduleName.toLowerCase()) {
        return folderName;
    } else {
        return folderName + '-' + moduleName.toLowerCase();
    }
}
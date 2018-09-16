const path = require('path');
const fs = require('fs-extra');

const downloadJson = require('../download_json');
const downloadTgz = require('../download_tgz');
const getDependencies = require('../get_dependencies');

function downloadAll(packages, dir){
    dir = path.resolve(dir);

    const tgzDir = path.join(dir, 'tgzs');
    const jsonDir = path.join(dir, 'jsons');
    fs.ensureDirSync(tgzDir);
    fs.ensureDirSync(jsonDir);
    return downloadTgz(packages, tgzDir)
    .then(() => {
        console.log('tgz文件下载完成, 保存在目录 '+tgzDir);
        return getDependencies(packages)
    })
    .then((dependencies) => {
        const packages = [];
        const promises = dependencies.map((dependency) => {
            const package = dependency.split('@');
            const name = package[0];
            packages.push(package);
            return downloadJson(name, path.join(jsonDir, name+'.json'));
        })
        return Promise.all(promises).then(() => {
            console.log('json文件下载完成, 保存在目录 '+jsonDir);
            return Promise.resolve(packages);
        })
    })
}

module.exports = downloadAll;

// downloadAll(['express', 'jquery@1.9.1'], './store')
// .then(() => {
//     console.log('ok');
// })
// .catch(err => {
//     console.log(err);
// })
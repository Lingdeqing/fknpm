

const request = require('request');
const fs = require('fs-extra');

// 下载package.json文件
function getPackageJson(name, filepath) {
    return new Promise((resolve, reject) => {
        request('https://registry.npmjs.org/' + name)
            .pipe(fs.createWriteStream(filepath))
            .on('close', () => {
                console.log('下载json文件完成');
                resolve();
            })
            .on('error', err => {
                reject(err)
            })
    })
}

// getPackageJson('jquery', 'jquery.package.json');

module.exports = getPackageJson;
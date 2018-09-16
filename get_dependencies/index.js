const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const packageReg = /-- (\S+)[ \n]/g;

// 获取dir的根路径
function getRoot(dir) {
    dir = path.resolve(dir);
    let root = '/';
    if (process.platform == 'win32') {
        root = /.+:\\/.exec(dir)[0];
    }
    return root;
}

/**
 * 使用npm install命令安装包
 * @param {Array<String>|String} packages 要安装的包名，单个字符串，或字符串数组
 * @param {String|undefined} dir 包安装到的目录，如果不传，则是当前目录
 */
function npmInstall(packages, dir) {
    if (!Array.isArray(packages)) packages = [packages];
    if (dir) dir = path.resolve(dir);
    
    return new Promise((resolve, reject) => {
        cb = (error, stdout, stderr) => {
            if(error){
                reject(error)
            } else {
                if(stderr){
                    console.log(stderr);
                }
                resolve(stdout);
            }
        }
        exec('npm install ' + packages.join(' '), {
            cwd: dir || process.cwd()
        }, cb)
    })
}

/**
 * 获取某个目录下面所有的包名
 * @param {String|undefined} dir 包安装到的目录，如果不传，则是当前目录
 */
function npmLs(dir) {
    return new Promise((resolve, reject) => {
        exec('npm ls', {
            cwd: dir || process.cwd()
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(`npm ls error:\n ${error}`);
            }
            const treeStr = stdout;

            const packages = [];
            const set = new Set();
            treeStr.replace(packageReg, (match, package) => {
                if (set.has(package)) {   // 去重
                    return;
                }
                set.add(package);
                packages.push(package);
            })

            resolve(packages);
        });
    })
}

/**
 * 获取所有的包名
 * @param {Array|String|undefined} packages 要获取的包名，单个字符串，或字符串数组，如果不传则为当前目录
 */
function getDependencies(packages) {
    const dir = path.join(getRoot('./'), '__tmp_dir_for_get_npm_dependencies');
    return fs.emptyDir(dir)
        .then(() => {
            return npmInstall(packages, dir);
        })
        .then(() => {
            return npmLs(dir);
        })
        .then((dependencies) => {
            return fs.remove(dir).then(() => Promise.resolve(dependencies))
        })
}

module.exports = getDependencies;

// 测试当前目录
// getAllPackages()
// .then(packages => {
//     console.log(packages)
// })

// 测试指定包
// getAllPackages(['jquery', 'express'])
// .then(packages => {
//     console.log(packages)
// })

// rename('.', 'node_modules', 'node_modules_')
// rename('./', 'node_modules_', 'node_modules')
// 查看npm版本，不是3则报错
// 获取原来的cache目录
// 设置为当前目录下要下载到的目录
// 下载需要的文件
// 恢复运来的cache目录

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

function cmd(str, opts) {
    return new Promise((resolve, reject) => {
        cb = (error, stdout, stderr) => {
            if (error || stderr) {
                reject(error || stderr);
            } else {
                resolve(stdout);
            }
        }
        if (opts) exec(str, opts, cb);
        else exec(str, cb);
    })
}

// 获取npm版本
function getNpmVersion() {
    return cmd('npm -v');
}

// 获取npm cache目录
function getNpmCacheDir() {
    return cmd('npm config get cache');
}

// 设置新的npm cache目录
function setNpmCacheDir(cacheDir) {
    return cmd('npm config set cache ' + cacheDir);
}

// 在目录dir下安装包
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


// 获取dir的根路径
function getRoot(dir) {
    dir = path.resolve(dir);
    let root = '/';
    if (process.platform == 'win32') {
        root = /.+:\\/.exec(dir)[0];
    }
    return root;
}


// getNpmVersion()
// .then(version => {
//     console.log(parseInt(version))
// })

// getNpmCacheDir()
// .then(cacheDir => {
//     console.log(cacheDir);
// })

// setNpmCacheDir(path.resolve('./npm_cache'))
// .then(() => {
//     console.log('ok')
// })

/**
 * 下载包到本地
 * @param {Array<String>|String} packages 要下载的包列表，如果一个包，可以传单个字符串
 * @param {String} dir 存放的目录
 */
function download(packages, dir) {
    dir = path.resolve(dir);

    const tmpdir = path.join(getRoot(dir), '__tmp_dir_for_get_npm_tgz');  // 临时目录设置为根目录
    const final = () => {   // 清场工作
        const promises = [fs.remove(tmpdir)];
        if (dir !== oldCacheDir) {  // 下载完成，将npm cache目录设置回去
            // promises.push(setNpmCacheDir(oldCacheDir));
        }
        return Promise.all(promises);
    }

    var oldCacheDir;
    return getNpmVersion()
        .then(npmVersion => {   // 检查npm版本
            if (parseInt(npmVersion) > 3) {
                const err = 'npm版本高于3';
                console.log(err);
                console.log('使用 npm install -g npm@3降级npm');
                return Promise.reject('npm版本高于3');
            }
            return getNpmCacheDir()
        })
        .then(cacheDir => { // 设置npm cache目录为要保存到的目录
            oldCacheDir = cacheDir.trim()
            if (dir !== oldCacheDir) {
                return setNpmCacheDir(dir);
            }
        })
        .then(() => {   // 创建临时目录用来执行npm install命令
            return fs.ensureDir(tmpdir);
        })
        .then(() => {   // 执行npm install 去触发npm cache，从而下载tgz包
            return npmInstall(packages, tmpdir);
        })
        .then(() => {
            return final();
        })
}

module.exports = download;
// download(['jquery', 'jquery@1.9.1', 'jquery@3.3.0', 'jquery@3.2.1', 'jquery@3.2.0'], './tgzs')
// .catch(error => {
//     console.log(error)
// })

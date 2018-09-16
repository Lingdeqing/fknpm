const download = require('../../download_all_needed');
const fs = require('fs-extra');
const path = require('path');

// 转换为npm需要的目录，然后打包
function transform(dir, dependencies, tmpdir) {
    const storage = path.join(tmpdir, 'storage');
    const tgzDir = path.join(dir, 'tgzs');
    const jsonDir = path.join(dir, 'jsons');
    fs.emptyDir(storage)
        .then(() => {
            const promises = [];
            const jsonSet = {};
            dependencies.forEach(([name, version]) => {
                const packageDir = path.join(storage, name);
                promises.push(
                    fs.ensureDir(packageDir)
                        .then(() => {
                            const copies = [];
                            copies.push(fs.copy(path.join(tgzDir, name, version, 'package.tgz'), path.join(packageDir, `${name}-${version}.tgz`)));

                            if (!jsonSet[name]) {
                                jsonSet[name] = 1;
                                copies.push(fs.copy(path.join(jsonDir, `${name}.json`), path.join(packageDir, 'packages.json')));
                            }
                            return Promise.all(copies);
                        }));
            })
            return Promise.all(promises);
        })
}

function start(packages, store) {
    const tmpdir = path.resolve('./tmp_storage');
    return download(packages, store)
        .then(dependencies => {
            return transform(store, dependencies, tmpdir)
        })
        .then(() => {
            console.log(`完成转换文件为sinopia需要的结构， 存放在目录${tmpdir}`)
        })
}

start('express', './store');
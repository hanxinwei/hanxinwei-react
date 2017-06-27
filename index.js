#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const chalk = require('chalk');

let force = process.argv.some(arg => arg === '--force' || arg === '-f') ? true : false;

let copyFile = (file, target, callback, force = false) => {
    if (!fs.exists(file) || force) {
        fs.createReadStream(file)
            .pipe(fs.createWriteStream(target))
            .on('finish', () => {
                if (callback) {
                    callback();
                }
            });
    }
}
let copyDirContent = (dir, target, callback, force = false) => {
    mkdirp(target, () => {
        fs.readdir(dir, (err, files) => {
            let finishCount = 0;
            files.forEach((file) => {
                let filePath = path.join(dir, file);
                let targetPath = path.join(target, file);
                fs.stat(filePath, (err, stats) => {
                    if (stats.isFile()) {
                        copyFile(filePath, targetPath, () => {
                            finishCount++;
                            if (finishCount === files.length && callback) {
                                callback();
                            }
                        }, force);
                    }
                    else if (stats.isDirectory()) {
                        copyDirContent(filePath, targetPath, () => {
                            finishCount++;
                            if (finishCount === files.length && callback) {
                                callback();
                            }
                        }, force);
                    }
                });
            })
        });
    });
}

let copyPromise = () => new Promise((resolve) => {
    copyDirContent(path.resolve(__dirname, './files'), process.cwd(), () => {
        resolve();
    }, force);
});

let renameGitignorePromise = () => new Promise((resolve) => {
    let gitignorefile = path.resolve(process.cwd(), './gitignore.txt');
    if (fs.existsSync(gitignorefile)) {
        fs.rename(gitignorefile, path.resolve(process.cwd(), './.gitignore'), (err) => {
            if (err) throw err;
            resolve();
        });
    }
    else {
        resolve();
    }
});

let addPackageName = () => new Promise((resolve) => {
    let file = path.resolve(process.cwd(), './package.json');
    fs.readFile(file, 'utf8', (err, data) => {
        fs.writeFile(file, data.replace('__name__', process.cwd().split(path.sep).pop()), (err) => {
            if (err) throw err;
            resolve();
        });
    });
});

copyPromise().then(() => {
    Promise.all([renameGitignorePromise(), addPackageName()]).then(() => {
        console.log(chalk.green('Success'));
    })
})






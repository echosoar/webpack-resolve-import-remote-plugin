const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const gitPathReg = /^\.\/([\w\.\-]*)\/([\.\-_\w]*)\/([\.\-_\w]*)(?::([\w\.\-_]*))?/i

const checkPath = (pathObj, cb) => {

  let localRoot = `${require('os').homedir()}/.remoteImport`;
  let sitePath = `${localRoot}/${pathObj[1]}`;
  let userPath = `${sitePath}/${pathObj[2]}`;
  let branch = pathObj[4] || 'master';

  if (!fs.existsSync(localRoot)) fs.mkdirSync(localRoot);
  if (!fs.existsSync(sitePath)) fs.mkdirSync(sitePath);
  if (!fs.existsSync(userPath)) fs.mkdirSync(userPath);

  let res = {
    success: true,
    localPath: `${userPath}/${pathObj[3]}_${branch}`,
    git: `git@${pathObj[1]}:${pathObj[2]}/${pathObj[3]}.git`,
    branch
  };

  if (fs.existsSync(`${userPath}/${pathObj[3]}_${branch}`)) {
    cb(res);
  } else {
    console.log(pathObj[3] + " installing...");
    try {
      execSync(`cd ${userPath};git clone -b ${branch} ${res.git} ${pathObj[3]}_${branch};cd ${pathObj[3]}_${branch};tnpm i`);
    } catch(e) {
      console.log(pathObj[3] + " install error: " + e.message);
      res.success = false;
    }
    
    cb(res);
  }
}

const getPath = (relativePath, local) => {
  if (relativePath) {
    if (/\/$/.test(relativePath)) relativePath += 'index.js';
  }
  
  if (!relativePath) {
    let pkgAddr = path.resolve(local, './package.json');
    let pkg = {};
    if (fs.existsSync(pkgAddr)) {
      pkg = require(pkgAddr);
    }
    relativePath = pkg.main || 'index.js';
  }

  return path.resolve(local, './' + relativePath);
}


class WebpackIRPlugin {

  apply (resolver) {
    resolver.plugin('after-parsed-resolve', function (request, callback) {
      if (gitPathReg.test(request.request)) {

        let pathObj = gitPathReg.exec(request.request);
        
        checkPath(pathObj, (dep) => {
          
          let relativePath = request.request.replace(gitPathReg, '');

          let innerPath = getPath(relativePath, dep.localPath);

          let obj = Object.assign({}, request, {
            request: innerPath
          });
  
          resolver.doResolve('resolve', obj, '', callback);
        });
        
      } else {
        callback()
      }
      
    });
  }
}

module.exports = WebpackIRPlugin;
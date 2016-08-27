window.nativeRequire = function (name) {
  return require(name)
}

window.remoteRequire = function (name) {
  const path = require('path')
  const {remote} = require('electron')
  return remote.require(path.join(__dirname, '../../app/app/', name))
}

window.appNodeModulesRequire = function (name) {
  return require('../../app/node_modules/' + name)
}

window.appPackage = function () {
  return require('../../app/package.json')
}

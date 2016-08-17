const pkg = require('../package.json')
const Licenses = require('./Licenses')
const JSBuilder = require('./JSBuilder')
const ElectronBuilder = require('./ElectronBuilder')
const ReleaseAssets = require('./ReleaseAssets')
const Distribution = require('./Distribution')

const argv = require('yargs').argv

const argvPlatform = (Array.isArray(argv.platform) ? new Set(argv.platform) : new Set([argv.platform || 'all']))
const platforms = argvPlatform.has('all') ? ['darwin', 'linux', 'win32'] : Array.from(argvPlatform)
const dist = argv.distribution

Promise.resolve()
  .then(() => dist ? JSBuilder.pruneNPM() : Promise.resolve())
  .then(JSBuilder.runWebpack)
  .then(() => ElectronBuilder.packageApp(platforms, pkg))
  .then(() => dist ? Licenses.buildLicensesIntoReleases(platforms) : Promise.resolve())
  .then(() => dist ? ReleaseAssets.copyAssetsIntoReleases(platforms) : Promise.resolve())
  .then(() => dist ? Distribution.distribute(platforms, pkg) : Promise.resolve())
  .then(
    () => { },
    (err) => {
      console.log(err)
      console.log(err.stack)
    }
  )

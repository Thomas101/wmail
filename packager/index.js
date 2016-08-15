const pkg = require('../package.json')
const Licenses = require('./Licenses')
const JSBuilder = require('./JSBuilder')
const ElectronBuilder = require('./ElectronBuilder')
const ReleaseAssets = require('./ReleaseAssets')

const argv = require('yargs').argv

const argvPlatform = (Array.isArray(argv.platform) ? new Set(argv.platform) : new Set([argv.platform || 'all']))
const platforms = argvPlatform.has('all') ? ['darwin', 'linux', 'win32'] : Array.from(argvPlatform)
const noLicense = argv.noLicense

Promise.resolve()
  .then(JSBuilder.pruneNPM)
  .then(JSBuilder.runWebpack)
  .then(() => ElectronBuilder.packageApp(platforms, pkg))
  .then(() => noLicense ? Promise.resolve() : Licenses.buildLicensesIntoReleases(platforms))
  .then(() => ReleaseAssets.copyAssetsIntoReleases(platforms))
  .then(
    () => { },
    (err) => {
      console.log(err)
      console.log(err.stack)
    }
  )

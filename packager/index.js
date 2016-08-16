const pkg = require('../package.json')
const Licenses = require('./Licenses')
const JSBuilder = require('./JSBuilder')
const ElectronBuilder = require('./ElectronBuilder')
const ReleaseAssets = require('./ReleaseAssets')

const argv = require('yargs').argv

const argvPlatform = (Array.isArray(argv.platform) ? new Set(argv.platform) : new Set([argv.platform || 'all']))
const platforms = argvPlatform.has('all') ? ['darwin', 'linux', 'win32'] : Array.from(argvPlatform)
const distribution = argv.distribution

Promise.resolve()
  .then(() => distribution ? JSBuilder.pruneNPM() : Promise.resolve())
  .then(JSBuilder.runWebpack)
  .then(() => ElectronBuilder.packageApp(platforms, pkg))
  .then(() => distribution ? Licenses.buildLicensesIntoReleases(platforms) : Promise.resolve())
  .then(() => distribution ? ReleaseAssets.copyAssetsIntoReleases(platforms) : Promise.resolve())
  .then(
    () => { },
    (err) => {
      console.log(err)
      console.log(err.stack)
    }
  )

const fs = require('fs-extra')
const path = require('path')
const { ROOT_PATH } = require('./constants')

class ReleaseAssets {

  /**
  * Copies the assets into the releases folders
  * @param platforms: the platforms to build for
  * @return promise
  */
  static copyAssetsIntoReleases (platforms) {
    if (new Set(platforms).has('darwin')) {
      fs.copySync(path.join(__dirname, 'dmg/First Run.html'), path.join(ROOT_PATH, 'WMail-darwin-x64/First Run.html'))
      return Promise.resolve()
    } else {
      return Promise.resolve()
    }
  }
}

module.exports = ReleaseAssets

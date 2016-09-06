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
    const platformsSet = new Set(platforms)
    if (platformsSet.has('darwin')) {
      fs.copySync(path.join(__dirname, 'dmg/First Run.html'), path.join(ROOT_PATH, 'WMail-darwin-x64/First Run.html'))
    } else if (platformsSet.has('linux')) {
      fs.copySync(path.join(ROOT_PATH, 'assets/icons/app.png'), path.join(ROOT_PATH, 'WMail-linux-ia32/icon.png'))
      fs.copySync(path.join(ROOT_PATH, 'assets/icons/app.png'), path.join(ROOT_PATH, 'WMail-linux-x64/icon.png'))
    }

    return Promise.resolve()
  }
}

module.exports = ReleaseAssets

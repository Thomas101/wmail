const appdmg = require('appdmg')
const path = require('path')
const { ROOT_PATH } = require('./constants')
const fs = require('fs-extra')
const TaskLogger = require('./TaskLogger')

class Distribution {

  /**
  * Distributes the darin version of the app
  * @param pkg: the package info
  * @return promise
  */
  static distributeDarwin (pkg) {
    if (process.platform !== 'darwin') {
      return Promise.reject(new Error('Darwin distribution only supported from darwin'))
    }

    return new Promise((resolve, reject) => {
      const task = TaskLogger.start('OSX DMG')
      const filename = `WMail_${pkg.version.replace(/\./g, '_')}${pkg.prerelease ? '_prerelease' : ''}.dmg`
      const distPath = path.join(ROOT_PATH, 'dist')
      const targetPath = path.join(distPath, filename)
      fs.mkdirsSync(distPath)
      try {
        fs.unlinkSync(targetPath)
      } catch (ex) { /* no-op */ }

      const dmgCreate = appdmg({
        target: targetPath,
        basepath: ROOT_PATH,
        specification: {
          title: `WMail ${pkg.version} ${pkg.prerelease ? 'Prerelease' : ''}`,
          format: 'UDBZ',
          icon: 'assets/icons/app.ico',
          'background-color': '#CCCCCC',
          background: path.join(__dirname, 'dmg/background.png'),
          'icon-size': 100,
          window: {
            size: { width: 600, height: 500 }
          },
          contents: [
            { x: 150, y: 100, type: 'file', path: 'WMail-darwin-x64/WMail.app' },
            { x: 450, y: 100, type: 'link', path: '/Applications' },
            { x: 150, y: 400, type: 'file', path: 'WMail-darwin-x64/Installing on OSX.html' },
            { x: 300, y: 400, type: 'file', path: 'WMail-darwin-x64/LICENSE' },
            { x: 450, y: 400, type: 'file', path: 'WMail-darwin-x64/vendor-licenses' }
          ]
        }
      })
      dmgCreate.on('finish', () => {
        task.finish()
        resolve()
      })
      dmgCreate.on('error', (err) => {
        task.fail()
        reject(err)
      })
    })
  }

  /**
  * Distributes the app for the given platforms
  * @param platforms: the platforms to distribute for
  * @param pkg: the package info
  * @return promise
  */
  static distribute (platforms, pkg) {
    return Promise.all(platforms.map((platform) => {
      if (platform === 'darwin') {
        return Distribution.distributeDarwin(pkg)
      } else {
        return Promise.resolve()
      }
    }))
  }
}

module.exports = Distribution

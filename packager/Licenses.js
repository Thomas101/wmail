const TaskLogger = require('./TaskLogger')
const nlf = require('nlf')
const fs = require('fs-extra')
const path = require('path')
const { ROOT_PATH } = require('./constants')

class Licenses {

  /**
  * Combines all the NPM Licenses into one file
  * @return promise with the full text content
  */
  static combineNPMLicenses () {
    return new Promise((resolve, reject) => {
      const task = TaskLogger.start('Combine Licenses')
      nlf.find({ directory: ROOT_PATH, production: true }, function (err, data) {
        if (err) {
          task.fail()
          reject(err)
        } else {
          const licenses = data.reduce((acc, item) => {
            const name = item.name
            if (item.licenseSources.license.sources.length) {
              const licensePath = item.licenseSources.license.sources[0].filePath
              const license = fs.readFileSync(licensePath, 'utf8')
              acc.push([
                '----------------------------------------------',
                '------------------ ' + name + ' ------------------',
                '----------------------------------------------',
                license
              ].join('\n'))
            }
            return acc
          }, [])
          const licenseText = licenses.join('\n\n\n\n')
          task.finish()
          resolve(licenseText)
        }
      })
    })
  }

  /**
  * Moves the licenses into place
  * @param electronOutputPath: the build path that electron has output to
  * @param npmLicenseString: the npm licenses string to write out
  * @return promise
  */
  static buildLicenses (electronOutputPath, npmLicenseString) {
    return new Promise((resolve, reject) => {
      const J = (p) => path.join(electronOutputPath, p)
      fs.mkdirsSync(J('vendor-licenses'))
      fs.unlinkSync(J('version'))
      fs.move(J('LICENSES.chromium.html'), J('vendor-licenses/LICENSES.chromium.html'), () => {
        const electronLicense = [
          '----------------------------------------------',
          '------------------ electron ------------------',
          '----------------------------------------------',
          fs.readFileSync(J('LICENSE'))
        ].join('\n') + '\n\n\n\n'
        const licenses = electronLicense + npmLicenseString
        fs.writeFile(J('vendor-licenses/LICENSES.vendor'), licenses)
        fs.unlinkSync(J('LICENSE'))
        fs.copySync(path.join(ROOT_PATH, 'LICENSE'), J('LICENSE'))

        resolve()
      })
    })
  }

  /**
  * Builds the licenses into the releases
  * @param platforms: the platforms to build for
  * @return promise
  */
  static buildLicensesIntoReleases (platforms) {
    return Promise.resolve()
      .then(Licenses.combineNPMLicenses)
      .then((npmLicenseString) => {
        return Promise.all(platforms.reduce((acc, platform) => {
          if (platform === 'darwin') {
            acc.push(Licenses.buildLicenses(path.join(ROOT_PATH, 'WMail-darwin-x64/'), npmLicenseString))
          } else if (platform === 'linux') {
            acc.push(Licenses.buildLicenses(path.join(ROOT_PATH, 'WMail-linux-ia32/'), npmLicenseString))
            acc.push(Licenses.buildLicenses(path.join(ROOT_PATH, 'WMail-linux-x64/'), npmLicenseString))
          } else if (platform === 'win32') {
            acc.push(Licenses.buildLicenses(path.join(ROOT_PATH, 'WMail-win32-ia32/'), npmLicenseString))
            acc.push(Licenses.buildLicenses(path.join(ROOT_PATH, 'WMail-win32-x64/'), npmLicenseString))
          }
          return acc
        }, []))
      })
  }
}

module.exports = Licenses

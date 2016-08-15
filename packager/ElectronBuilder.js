const packager = require('electron-packager')
const TaskLogger = require('./TaskLogger')
const path = require('path')
const { ROOT_PATH } = require('./constants')

class ElectronBuilder {

  /**
  * @return the string that defines the items to ignore
  */
  static packagerIgnoreString () {
    return '^(' + [
      // Folders
      '/assets',
      '/github_images',
      '/node_modules',
      '/release',
      '/src',
      '/packager',

      // Files
      '/.editorconfig',
      '/.gitignore',
      '/.travis.yml',
      '/.LICENSE',
      '/.npm-debug.log',
      '/packager.js',
      '/README.md',
      '/webpack.config.js',

      // Output folders
      '/WMail-linux-ia32',
      '/WMail-linux-x64',
      '/WMail-win32-ia32',
      '/WMail-win32-x64',
      '/WMail-win32-ia32-Installer'
    ]
    .join('|') + ')'
  }

  /**
  * Pacakges the electron app
  * @param platform: the platform to package for
  * @param pkg: the package to read version etc from
  * @return promise on completion
  */
  static packageApp (platform, pkg) {
    return new Promise((resolve, reject) => {
      const task = TaskLogger.start('Package Electron')
      packager({
        dir: ROOT_PATH,
        name: 'WMail',
        platform: platform,
        arch: (platform === 'win32' ? 'ia32' : 'all'),
        version: pkg.dependencies['electron-prebuilt'],
        'app-bundle-id': 'tombeverley.wmail',
        'app-version': pkg.version,
        'app-copyright': 'Copyright ' + pkg.author + '(' + pkg.license + ' License)',
        icon: path.join(ROOT_PATH, 'assets/icons/app'),
        overwrite: true,
        asar: true,
        prune: false,
        'version-string': {
          CompanyName: pkg.author,
          FileDescription: pkg.description,
          OriginalFilename: pkg.name,
          ProductName: 'WMail'
        },
        ignore: ElectronBuilder.packagerIgnoreString()
      }, function (err, appPath) {
        if (err) {
          task.fail()
          reject(err)
        } else {
          task.finish()
          resolve()
        }
      })
    })
  }
}

module.exports = ElectronBuilder

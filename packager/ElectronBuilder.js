const packager = require('electron-packager')
const TaskLogger = require('./TaskLogger')
const path = require('path')
const { ROOT_PATH } = require('./constants')

const PLATFORM_ARCHES = {
  darwin: ['x64'],
  linux: ['x64', 'ia32'],
  win32: ['x64', 'ia32']
}

class ElectronBuilder {

  /**
  * @return the string that defines the items to ignore
  */
  static packagerIgnoreString (platform, arch) {
    const ignores = [
      // Folders
      '/assets',
      '/github_images',
      '/node_modules',
      '/release',
      '/src',
      '/packager',
      '/dist',

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
      '/WMail-darwin-x64'
    ]

    // Spellchecker
    const wmailSpellcheckerPath = path.join(ROOT_PATH, 'bin/app/node_modules/wmail-spellchecker')
    const wmailSpellchecker = require(path.join(wmailSpellcheckerPath, 'package.json'))
    const wmailSpellcheckerIgnores = Object.keys(wmailSpellchecker.wmailPlatformCode)
      .map((platformArch) => `${platform}_${arch}` === platformArch ? undefined : platformArch)
      .filter((platformArch) => !!platformArch)
      .map((platformArch) => {
        const ignorePath = path.join(wmailSpellcheckerPath, wmailSpellchecker.wmailPlatformCode[platformArch])
        return '/' + path.relative(ROOT_PATH, ignorePath)
      })

    const allIgnores = ignores.concat(wmailSpellcheckerIgnores)
    return '^(' + allIgnores.join('|') + ')'
  }

  /**
  * Packages a single platform and arch
  * @param platform: the platform string
  * @param arch: the arch
  * @param pkg: the package to build for
  * @return promise
  */
  static packageSinglePlatformArch (platform, arch, pkg) {
    return new Promise((resolve, reject) => {
      packager({
        dir: ROOT_PATH,
        name: 'WMail',
        platform: platform,
        arch: arch,
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
        'extend-info': {
          'CFBundleURLSchemes': ['mailto']
        },
        ignore: ElectronBuilder.packagerIgnoreString(platform, arch)
      }, function (err, appPath) {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  /**
  * Pacakges the electron app
  * @param platforms: the platforms to package for
  * @param pkg: the package to read version etc from
  * @return promise on completion
  */
  static packageApp (platforms, pkg) {
    const task = TaskLogger.start('Package Electron')
    const tasks = platforms.reduce((acc, platform) => {
      return acc.concat(PLATFORM_ARCHES[platform].map((arch) => {
        return { platform: platform, arch: arch }
      }))
    }, [])

    return Promise.resolve()
      .then(() => {
        return tasks.reduce((acc, { platform, arch }) => {
          return acc.then(() => ElectronBuilder.packageSinglePlatformArch(platform, arch, pkg))
        }, Promise.resolve())
      })
      .then(() => task.finish(), (err) => task.fail(err))
  }
}

module.exports = ElectronBuilder

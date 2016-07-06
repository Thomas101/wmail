'use strict'
const packager = require('electron-packager')
const pkg = require('./package.json')
const fs = require('fs-extra')
const childProcess = require('child_process')
const path = require('path')
const nlf = require('nlf')
const electronInstaller = require('electron-winstaller')
const platform = process.argv[2] || 'darwin'

class PackageBuilder {

  /* **************************************************************************/
  // Build tasks
  /* **************************************************************************/

  buildWebpack () {
    return new Promise((resolve, reject) => {
      console.log('[START] Webpack')
      const cmd = 'node node_modules/webpack/bin/webpack.js -p'
      const args = {maxBuffer: 1024 * 1024} // Give ourselves a meg of buffer. Webpack can be very verbose
      childProcess.exec(cmd, args, (error, stdout, stderr) => {
        if (error) { console.error(error) }
        if (stdout) { console.log(`stdout: ${stdout}`) }
        if (stderr) { console.log(`stderr: ${stderr}`) }

        if (error) {
          reject()
        } else {
          console.log('[FINISH] Webpack')
          resolve()
        }
      })
    })
  }

  createWindowsInstaller () {
    return new Promise((resolve, reject) => {
      console.log('[START] Electron Winstaller')
      electronInstaller.createWindowsInstaller({
        appDirectory: './WMail-win32-ia32',
        authors: pkg.author,
        noMsi: true,
        outputDirectory: './WMail-win32-ia32-Installer',
        setupExe: 'WMail Setup.exe',
        setupIcon: path.resolve('./assets/icons/app.ico')
      }).then(() => {
        console.log('[FINISH] Electron Winstaller')
        resolve()
      }).catch(reject)
    })
  }

  packageApp () {
    return new Promise((resolve, reject) => {
      console.log('[START] Package')
      packager({
        dir: '.',
        name: 'WMail',
        platform: platform,
        arch: (platform === 'win32' ? 'ia32' : 'all'),
        version: pkg.dependencies['electron-prebuilt'],
        'app-bundle-id': 'tombeverley.wmail',
        'app-version': pkg.version,
        'app-copyright': 'Copyright ' + pkg.author + '(' + pkg.license + ' License)',
        icon: 'assets/icons/app',
        overwrite: true,
        asar: true,
        prune: false,
        'version-string': {
          CompanyName: pkg.author,
          FileDescription: pkg.description,
          OriginalFilename: pkg.name,
          ProductName: 'WMail'
        },
        ignore: '^(' + [
          // Folders
          '/assets',
          '/github_images',
          '/node_modules',
          '/release',
          '/src',

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
          '/WMail-win32-ia32-Installer'
        ]
        .join('|') + ')'
      }, function (err, appPath) {
        if (err) {
          reject(err)
        } else {
          console.log('[FINISH] Package')
          resolve()
        }
      })
    })
  }

  moveLicenses (outputPath) {
    return new Promise((resolve, reject) => {
      console.log('[START] License Copy')
      const J = path.join

      fs.mkdirsSync(J(outputPath, 'vendor-licenses'))
      fs.unlinkSync(J(outputPath, 'version'))
      fs.move(J(outputPath, 'LICENSES.chromium.html'), J(outputPath, 'vendor-licenses/LICENSES.chromium.html'), () => {
        fs.move(J(outputPath, 'LICENSE'), J(outputPath, 'vendor-licenses/LICENSE.electron'), () => {
          nlf.find({ directory: '.', production: true }, function (err, data) {
            if (err) {
              reject(err)
            } else {
              data.map((item) => {
                const name = item.name
                if (item.licenseSources.license.sources.length) {
                  const path = item.licenseSources.license.sources[0].filePath
                  fs.copySync(path, J(outputPath, 'vendor-licenses/LICENSE.' + name))
                }
              })

              fs.copySync('./LICENSE', J(outputPath, 'LICENSE'))
              console.log('[FINISH] License Copy')
              resolve()
            }
          })
        })
      })
    })
  }

  pruneNPM () {
    return new Promise((resolve, reject) => {
      console.log('[START] Prune NPM')
      const cmd = 'cd src/app; npm prune --production'
      const args = {maxBuffer: 1024 * 1024}
      childProcess.exec(cmd, args, (error, stdout, stderr) => {
        if (error) { console.error(error) }
        if (stdout) { console.log(`stdout: ${stdout}`) }
        if (stderr) { console.log(`stderr: ${stderr}`) }

        if (error) {
          reject()
        } else {
          console.log('[FINISH] Prune NPM')
          resolve()
        }
      })
    })
  }

  /* **************************************************************************/
  // Start stop
  /* **************************************************************************/

  start () {
    const start = new Date().getTime()
    console.log('[START] Packing for ' + platform)
    return Promise.resolve()
      .then(this.pruneNPM)
      .then(this.buildWebpack)
      .then(this.packageApp)
      .then(() => {
        if (platform === 'darwin') {
          fs.copySync('./release/Installing on OSX.html', './WMail-darwin-x64/Installing on OSX.html')
          return Promise.resolve()
            .then(() => this.moveLicenses('./WMail-darwin-x64/'))
        } else if (platform === 'linux') {
          return Promise.resolve()
            .then(() => this.moveLicenses('./WMail-linux-ia32/'))
            .then(() => this.moveLicenses('./WMail-linux-x64/'))
        } else if (platform === 'win32') {
          return Promise.resolve()
            .then(() => this.moveLicenses('./WMail-win32-ia32/'))
            // .then(this.createWindowsInstaller)
        } else {
          return Promise.reject()
        }
      })
      .then(() => {
        console.log(((new Date().getTime() - start) / 1000) + 's')
        console.log('[EXIT] Done')
      }, (err) => {
        console.log('[EXIT] Error')
        console.log(err)
        console.log(err.stack)
      })
  }
}

const builder = new PackageBuilder()
builder.start()

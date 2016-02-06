'use strict'

const packager = require('electron-packager')
const pkg = require('./package.json')
const fs = require('fs-extra')
const child_process = require('child_process')
const path = require('path')
const nlf = require('nlf')
const platform = process.argv[2] || 'darwin'

class PackageBuilder {

  /* **************************************************************************/
  // Build tasks
  /* **************************************************************************/

  buildWebpack () {
    return new Promise((resolve, reject) => {
      console.log('[START] Webpack')
      child_process.exec('node node_modules/webpack/bin/webpack.js -p', function (error, stdout, stderr) {
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

  packageApp () {
    return new Promise((resolve, reject) => {
      console.log('[START] Package')
      packager({
        dir: '.',
        name: 'WMail',
        platform: platform,
        arch: 'all',
        version: '0.36.7',
        'app-bundle-id': 'tombeverley.wmail',
        'app-version': pkg.version,
        icon: 'icons/app.icns',
        overwrite: true,
        ignore: '^(' + [
          '/icons',
          '/release',
          '/packager.js',
          '/webpack.config.js',
          '/screenshot.png',
          '/README.md',
          '/src',
          '/github_images',
          '/WMail-linux-ia32',
          '/WMail-linux-x64',
          '/WMail-darwin-x64'
        ]
        .concat(Object.keys(pkg.devDependencies).map(d => '/node_modules/' + d))
        .join('|') + ')'
      }, function (err, appPath) {
        if (err) {
          console.error(err)
          reject()
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
      fs.copySync('./LICENSE', J(outputPath, 'LICENSE'))
      fs.unlinkSync(J(outputPath, 'version'))
      fs.move(J(outputPath, 'LICENSES.chromium.html'), J(outputPath, 'vendor-licenses/LICENSES.chromium.html'), function () {
        fs.move(J(outputPath, 'LICENSE'), J(outputPath, 'vendor-licenses/LICENSE.electron'), function () {
          nlf.find({ directory: '.', production: true }, function (err, data) {
            if (err) {
              reject(err)
            } else {
              data.map(item => {
                console.log(item)
                const name = item.name
                if (item.licenseSources.license.sources.length) {
                  const path = item.licenseSources.license.sources[0].filePath
                  fs.copySync(path, J(outputPath, 'vendor-licenses/LICENSE.' + name))
                }
              })

              console.log('[FINISH] License Copy')
              resolve()
            }
          })
        })
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
      .then(this.buildWebpack)
      .then(this.packageApp)
      .then(() => {
        if (platform === 'darwin') {
          return this.moveLicenses('./WMail-darwin-x64/')
        } else if (platform === 'linux') {
          return Promise.resolve()
            .then(() => this.moveLicenses('./WMail-linux-ia32/'))
            .then(() => this.moveLicenses('./WMail-linux-x64/'))
        } else {
          return Promise.reject()
        }
      })
      .then(() => {
        console.log(((new Date().getTime() - start) / 1000) + 's')
        console.log('[EXIT] Done')
      }, () => {
        console.log('[EXIT] Error')
      })
  }
}

const builder = new PackageBuilder()
builder.start()

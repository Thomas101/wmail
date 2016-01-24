const packager = require('electron-packager')
const pkg = require('./package.json')
const fs = require('fs-extra')
const licenseNames = ['license', 'LICENSE', 'license.md', 'LICENSE.md', 'copying', 'COPYING']
const child_process = require('child_process')
const platform = process.argv[2] || 'darwin'

console.log('[START] Packing for ' + platform)
console.log('[START] Webpack')
child_process.exec('node node_modules/webpack/bin/webpack.js -p', function (error, stdout, stderr) {
  if (error) { console.error(error) }
  if (stdout) { console.log(`stdout: ${stdout}`) }
  if (stderr) { console.log(`stderr: ${stderr}`) }

  console.log('[FINISH] Webpack')
  console.log('[START] Package')
  packager({
    dir: '.',
    name: 'WMail',
    platform: platform,
    arch: 'all',
    version: '0.36.4',
    'app-bundle-id': 'tombeverley.wmail',
    'app-version': pkg.version,
    icon: 'icons/app.icns',
    overwrite: true,
    ignore: '^(' + [
      '/release',
      '/icons',
      '/packager.js',
      '/webpack.config.js',
      '/screenshot.png',
      '/README.md',
      '/src',
      '/github_images'
    ]
    .concat(Object.keys(pkg.devDependencies).map(d => '/node_modules/' + d))
    .join('|') + ')'
  }, function (err, appPath) {
    if (err) {
      console.error(err)
    }
    console.log('[FINISH] Package')
    console.log('[START] License Copy')

    fs.mkdirsSync('./WMail-darwin-x64/vendor-licenses')
    fs.move('./WMail-darwin-x64/LICENSES.chromium.html', './WMail-darwin-x64/vendor-licenses/LICENSES.chromium.html', function () {
      fs.move('./WMail-darwin-x64/LICENSE', './WMail-darwin-x64/vendor-licenses/LICENSE.electron', function () {
        Object.keys(pkg.dependencies).forEach(function (pName) {
          licenseNames.forEach(function (lName) {
            try {
              fs.statSync('./node_modules/' + pName + '/' + lName)
              fs.copySync('./node_modules/' + pName + '/' + lName, './WMail-darwin-x64/vendor-licenses/LICENSE.' + pName)
            } catch (ex) { }
          })
        })
        fs.copySync('./LICENSE', './WMail-darwin-x64/LICENSE')
        console.log('[FINISH] License Copy')

        console.log('[EXIT] Done')
      })
    })
  })
})

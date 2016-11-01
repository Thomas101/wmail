const appdmg = process.platform === 'darwin' ? require('appdmg') : undefined
const path = require('path')
const fs = require('fs-extra')
const childProcess = require('child_process')
const TaskLogger = require('./TaskLogger')
const uuid = require('uuid')
const debianInstaller = require('nobin-debian-installer')
const recursiveReaddir = require('recursive-readdir')
const temp = require('temp')
temp.track()

const { ROOT_PATH } = require('./constants')
const { WINDOWS_UPGRADE_CODE } = require('../src/shared/credentials')

const ARCH = { X86: 'x86', X64: 'x64' }
const ARCH_FILENAME = { 'x86': 'ia32', 'x64': 'x86_64' }

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
      const filename = `WMail_${pkg.version.replace(/\./g, '_')}${pkg.prerelease ? '_prerelease' : ''}_osx.dmg`
      const distPath = path.join(ROOT_PATH, 'dist')
      const targetPath = path.join(distPath, filename)
      fs.mkdirsSync(distPath)
      if (fs.existsSync(targetPath)) {
        fs.removeSync(targetPath)
      }

      const dmgCreate = appdmg({
        target: targetPath,
        basepath: ROOT_PATH,
        specification: {
          title: `WMail ${pkg.version} ${pkg.prerelease ? 'Prerelease' : ''}`,
          format: 'UDBZ',
          icon: 'assets/icons/app.icns',
          'background-color': '#CCCCCC',
          background: path.join(__dirname, 'dmg/background.png'),
          'icon-size': 100,
          window: {
            size: { width: 600, height: 500 }
          },
          contents: [
            { x: 150, y: 100, type: 'file', path: 'WMail-darwin-x64/WMail.app' },
            { x: 450, y: 100, type: 'link', path: '/Applications' },
            { x: 150, y: 400, type: 'file', path: 'WMail-darwin-x64/First Run.html' },
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
  * Distributes the windows version of the app
  * @param pkg: the package info
  * @param arch: one of 'x86' or 'x64'
  * @return promise
  */
  static distributeWindows (pkg, arch) {
    return new Promise((resolve, reject) => {
      const task = TaskLogger.start(`Windows MSI Prep (${arch})`)

      // Pre-calc all the needed paths
      const filename = `WMail_${pkg.version.replace(/\./g, '_')}${pkg.prerelease ? '_prerelease' : ''}_windows_${ARCH_FILENAME[arch]}`
      const distPath = path.join(ROOT_PATH, 'dist')
      const builtPath = path.join(ROOT_PATH, arch === ARCH.X64 ? 'WMail-win32-x64' : 'WMail-win32-ia32')
      const targetPath = path.join(distPath, filename)
      const aipName = `WMail_${ARCH_FILENAME[arch]}.aip`
      const aipPath = path.join(__dirname, 'msi', aipName)

      // Clean-up old & Copy across
      if (fs.existsSync(targetPath)) {
        fs.removeSync(targetPath)
      }
      try {
        fs.copySync(builtPath, targetPath)
      } catch (ex) { task.fail(); reject(ex); return }

      // Validate the installer file
      recursiveReaddir(targetPath, (error, filePaths) => {
        if (error) { task.fail(error); reject(error); return }
        filePaths = filePaths.map((filePath) => path.relative(targetPath, filePath).split(path.sep).join('\\'))

        const aipContent = fs.readFileSync(aipPath, 'utf8')
        const missingAsset = filePaths.find((filePath) => aipContent.indexOf(filePath) === -1)
        if (missingAsset) {
          task.fail()
          reject('Windows api is missing the following asset: ' + missingAsset)
          return
        }

        const patchedAipContent = aipContent
          .replace('__WMAIL_OUTPUTFILENAME__', filename)
          .replace('__WMAIL_VERSION__', pkg.version)
          .replace('__WMAIL_UPGRADECODE__', WINDOWS_UPGRADE_CODE)
          .replace('__WMAIL_PRODUCTCODE__', uuid.v4().toUpperCase())

        fs.copySync(path.join(__dirname, 'msi/installer_icon.ico'), path.join(targetPath, 'installer_icon.ico'))
        fs.writeFileSync(path.join(targetPath, aipName), patchedAipContent)

        task.finish()
        resolve()
      })
    })
  }

  /**
  * Extracts the built windows MSI files
  * @param pkg: the package info
  * @param arch: one of 'x86' or 'x64'
  * @return promise
  */
  static finaliseWindowsDistribution (pkg, arch) {
    return new Promise((resolve, reject) => {
      const task = TaskLogger.start(`Windows MSI Finalise (${arch})`)

      const filename = `WMail_${pkg.version.replace(/\./g, '_')}${pkg.prerelease ? '_prerelease' : ''}_windows_${ARCH_FILENAME[arch]}`
      const distPath = path.join(ROOT_PATH, 'dist')
      const prepPath = path.join(distPath, filename)
      const setupFilesPath = `WMail_${ARCH_FILENAME[arch]}-SetupFiles`

      const msiPath = path.join(prepPath, setupFilesPath, filename + '.msi')
      const outputPath = path.join(distPath, filename + '.msi')

      fs.copySync(msiPath, outputPath)
      fs.removeSync(prepPath)

      task.finish()
      resolve()
    })
  }

  /**
  * Distributes the app for linux
  * @param pkg: the package info
  * @param arch: one of 'x86' or 'x64'
  * @return promise
  */
  static distributeLinuxTar (pkg, arch) {
    return new Promise((resolve, reject) => {
      const task = TaskLogger.start(`Linux tar (${arch})`)

      const filename = `WMail_${pkg.version.replace(/\./g, '_')}${pkg.prerelease ? '_prerelease' : ''}_linux_${ARCH_FILENAME[arch]}.tar.gz`
      const targetPath = path.join(ROOT_PATH, 'dist', filename)
      const builtDirectory = arch === ARCH.X64 ? 'WMail-linux-x64' : 'WMail-linux-ia32'

      if (fs.existsSync(targetPath)) {
        fs.removeSync(targetPath)
      }

      const cmd = `cd ${ROOT_PATH}; tar czf "${targetPath}" "${builtDirectory}"`
      childProcess.exec(cmd, {}, (error, stdout, stderr) => {
        if (error) { console.error(error) }
        if (stdout) { console.log(`stdout: ${stdout}`) }
        if (stderr) { console.log(`stderr: ${stderr}`) }

        if (error) { task.fail(); reject(); return }

        task.finish()
        resolve()
      })
    })
  }

  /**
  * Distributes the app for linux (.deb package)
  * @param pkg: the package info
  * @param arch: one of 'x86' or 'x64'
  * @return promise
  */
  static distributeLinuxDeb (pkg, arch) {
    const ARCH_MAPPING = { x86: 'i386', x64: 'amd64' }
    const CWD_MAPPING = {
      x86: path.join(ROOT_PATH, 'WMail-linux-ia32'),
      x64: path.join(ROOT_PATH, 'WMail-linux-x64')
    }

    return new Promise((resolve, reject) => {
      const task = TaskLogger.start(`Linux deb (${arch})`)
      temp.mkdir('wmail_distribution_' + uuid.v4(), (err, tempPath) => {
        if (err) { task.fail(); reject(err); return }

        fs.writeFileSync(path.join(tempPath, 'wmail.desktop'), [
          '[Desktop Entry]',
          'Version=1.0',
          'Name=WMail',
          'Comment=' + pkg.description,
          'Exec=/opt/wmail-desktop/WMail',
          'Icon=/opt/wmail-desktop/icon.png',
          'Terminal=false',
          'Type=Application',
          'Categories=Application;Network;Email;'
        ].join('\n'))

        debianInstaller().pack({
          'package': pkg,
          info: {
            name: 'wmail-desktop',
            arch: ARCH_MAPPING[arch],
            depends: [
              'lsb-base (>= 3.2)',
              'libappindicator1 (>= 12.10.1)'
            ].join(','),
            targetDir: path.join(ROOT_PATH, 'dist'),
            scripts: {
              postinst: path.join(__dirname, 'deb/postinst')
            }
          }
        }, [
          { cwd: CWD_MAPPING[arch], expand: true, src: ['./**'], dest: '/opt/wmail-desktop' },
          { cwd: tempPath, src: ['./wmail.desktop'], dest: '/usr/share/applications' }
        ], function (err) {
          if (err) {
            task.fail()
            reject(err)
          } else {
            const outputFilename = `wmail-desktop_${pkg.version}-1_${ARCH_MAPPING[arch]}.deb`
            const filename = `WMail_${pkg.version.replace(/\./g, '_')}${pkg.prerelease ? '_prerelease' : ''}_linux_${ARCH_FILENAME[arch]}.deb`
            fs.move(path.join(ROOT_PATH, 'dist', outputFilename), path.join(ROOT_PATH, 'dist', filename), { clobber: true }, (err) => {
              if (err) {
                task.fail()
                reject(err)
              } else {
                task.finish()
                resolve()
              }
            })
          }
        })
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
    return platforms.reduce((acc, platform) => {
      if (platform === 'darwin') {
        return acc.then(() => Distribution.distributeDarwin(pkg))
      } else if (platform === 'win32') {
        return acc
          .then(() => Distribution.distributeWindows(pkg, ARCH.X86))
          .then(() => Distribution.distributeWindows(pkg, ARCH.X64))
      } else if (platform === 'linux') {
        return acc
          .then(() => Distribution.distributeLinuxTar(pkg, ARCH.X86))
          .then(() => Distribution.distributeLinuxDeb(pkg, ARCH.X86))
          .then(() => Distribution.distributeLinuxTar(pkg, ARCH.X64))
          .then(() => Distribution.distributeLinuxDeb(pkg, ARCH.X64))
      } else {
        return acc
      }
    }, Promise.resolve())
  }

  /**
  * Finalises the distrubiton of the apps for the given platforms
  * @param platforms: the platforms to finalise for
  * @param pkg: the package info
  * @return promise
  */
  static finaliseDistribute (platforms, pkg) {
    return platforms.reduce((acc, platform) => {
      if (platform === 'win32') {
        return acc
          .then(() => Distribution.finaliseWindowsDistribution(pkg, ARCH.X86))
          .then(() => Distribution.finaliseWindowsDistribution(pkg, ARCH.X64))
      } else {
        return acc
      }
    }, Promise.resolve())
  }
}

module.exports = Distribution

const childProcess = require('child_process')
const TaskLogger = require('./TaskLogger')
const path = require('path')
const { ROOT_PATH } = require('./constants')

class JSBuilder {

  /**
  * Runs the webpack tasks
  * @return promise
  */
  static runWebpack () {
    return new Promise((resolve, reject) => {
      const task = TaskLogger.start('Webpack')
      const cmd = `node ${path.join(ROOT_PATH, 'node_modules/webpack/bin/webpack.js')} -p`
      const args = {maxBuffer: 1024 * 1024} // Give ourselves a meg of buffer. Webpack can be very verbose
      childProcess.exec(cmd, args, (error, stdout, stderr) => {
        if (error) { console.error(error) }
        if (stdout) { console.log(`stdout: ${stdout}`) }
        if (stderr) { console.log(`stderr: ${stderr}`) }

        if (error) {
          task.fail()
          reject()
        } else {
          task.finish()
          resolve()
        }
      })
    })
  }

  /**
  * Prunes NPM
  * @return promise
  */
  static pruneNPM () {
    return new Promise((resolve, reject) => {
      const task = TaskLogger.start('NPM Prune')
      const cmd = `cd ${path.join(ROOT_PATH, 'src/app')}; npm prune --production`
      const args = {maxBuffer: 1024 * 1024}
      childProcess.exec(cmd, args, (error, stdout, stderr) => {
        if (error) {
          task.fail()
          reject(error)
        } else {
          task.finish()
          resolve()
        }
      })
    })
  }

  /**
  * Builds the app JavaScript
  * @return Promise
  */
  static buildJS () {
    return Promise.resolve()
      .then(JSBuilder.pruneNPM)
      .then(JSBuilder.runWebpack)
  }
}

module.exports = JSBuilder

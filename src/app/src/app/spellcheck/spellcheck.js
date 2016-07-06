const childProcess = require('child_process')
const path = require('path')

class Spellcheck {
  constructor () {
    this.process = null
  }

  start () {
    if (this.process === null) {
      this.process = childProcess.fork(path.join(__dirname, 'spellcheckProvider.js'), [])
    }
  }

  kill () {
    if (this.process) {
      this.process.kill()
      this.process = null
    }
  }
}

module.exports = new Spellcheck()

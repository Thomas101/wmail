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
}

module.exports = new Spellcheck()

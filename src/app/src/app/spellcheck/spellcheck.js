const childProcess = require('child_process')
const path = require('path')
const settingStore = require('../stores/settingStore')
const { SPELLCHECK_HTTP_PORT } = require('../../shared/constants')

class Spellcheck {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this.process = null
  }

  /* ****************************************************************************/
  // Start/Stop
  /* ****************************************************************************/

  start () {
    if (this.process === null) {
      const serverPath = path.join(__dirname, 'spellcheckProvider.js')
      const language = settingStore.language.customSpellcheckerLanguage
      this.process = childProcess.fork(serverPath, [
        '--port=' + SPELLCHECK_HTTP_PORT,
        '--language=' + (language || '_')
      ])
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

const elconsole = require('./elconsole')
try {
  const Google = require('./Google/Google')
  /*eslint-disable */
  const google = new Google()
  /*eslint-enable */
} catch (ex) {
  elconsole.error('Error', ex)
}

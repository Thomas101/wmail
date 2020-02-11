const elconsole = require('./elconsole')
try {
  const GoogleService = require('./Google/GoogleService')
  /*eslint-disable */
  const googleService = new GoogleService()
  /*eslint-enable */
} catch (ex) {
  elconsole.error('Error', ex)
}

const elconsole = require('./elconsole')
try {
  const GoogleMail = require('./Google/GoogleMail')
  /*eslint-disable */
  const googleMail = new GoogleMail()
  /*eslint-enable */
} catch (ex) {
  elconsole.error('Error', ex)
}

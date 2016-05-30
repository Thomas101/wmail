const uuid = require('uuid')
const fetch = require('node-fetch')
const credentials = require('../shared/credentials')
const osLanguage = require('os-locale').sync()
const pkg = require('../package.json')
const HttpsProxyAgent = require('https-proxy-agent')
const settingStore = require('./stores/settingStore')
const appStorage = require('./storage/appStorage')

class AppAnalytics {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/
  constructor () {
    if (!appStorage.getItem('ga-id')) {
      appStorage.setItem('ga-id', uuid.v4())
    }
    this.id = appStorage.getItem('ga-id')
  }

  /* ****************************************************************************/
  // Events Lifecycle
  /* ****************************************************************************/

  /**
  * @param window: the mailbox window
  * @param args: the items to append
  * @return the querystring with all arguments setup
  */
  send (window, args) {
    // https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters

    // If we're in cleardown this could end up being a bit flakey. Wrap it up just in case
    let windowSize
    try {
      windowSize = window && window.getSize ? window.getSize().join('x') : undefined
    } catch (ex) { /* no-op */ }

    const fullArgs = Object.assign({
      v: 1,
      tid: credentials.GOOGLE_ANALYTICS_ID,
      cid: this.id,
      t: 'screenview',
      vp: windowSize,
      ul: osLanguage,
      an: pkg.name,
      av: process.platform + '-' + pkg.version
    }, args)

    const qs = Object.keys(fullArgs).reduce((acc, k) => {
      acc.push(k + '=' + encodeURIComponent(fullArgs[k]))
      return acc
    }, []).join('&')

    const url = 'https://www.google-analytics.com/collect?' + qs
    return fetch(url, {
      method: 'post',
      agent: settingStore.proxy.enabled ? new HttpsProxyAgent(settingStore.proxy.url) : undefined
    })
  }

  /**
  * Log the app was opened
  * @param window: the mailbox window
  */
  appOpened (window) {
    if (!credentials.GOOGLE_ANALYTICS_ID) { return Promise.resolve() }
    return this.send(window, {
      cd: 'mailboxes'
    })
  }

  /**
  * Log the app is alive
  * @param window: the mailbox window
  */
  appHeartbeat (window) {
    if (!credentials.GOOGLE_ANALYTICS_ID) { return Promise.resolve() }
    return this.send(window, {
      cd: 'mailboxes'
    })
  }

  /**
  * Log an exception
  * @param window: the mailbox window
  * @param thread: the thread that it occured on
  * @param error: the error that was thrown
  */
  appException (window, thread, error) {
    if (!credentials.GOOGLE_ANALYTICS_ID) { return Promise.resolve() }
    return this.send(window, {
      dp: '/error/' + pkg.version,
      dt: 'error',
      t: 'exception',
      exd: '[' + thread + ']' + error.toString()
    })
  }
}

module.exports = AppAnalytics

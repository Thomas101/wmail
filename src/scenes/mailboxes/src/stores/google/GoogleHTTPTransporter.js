const qs = require('qs')
const querystring = require('querystring')

class GoogleHTTPTransporter {

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get USER_AGENT () { return 'emulated/google-api-nodejs-client/0.10.0' }

  /* **************************************************************************/
  // Requests
  /* **************************************************************************/

  /**
  * Makes a window.fetch request to the server whilst accepting arguments for nodejs request
  * @param requestOpts: the options provided to the nodejs request lib
  * @return promise from window.fetch
  */
  fetchWithNodeRequestParams (requestOpts) {
    const qsLib = requestOpts.useQuerystring ? querystring : qs
    const method = (requestOpts.method || 'GET').toUpperCase()
    const url = requestOpts.uri || requestOpts.url

    // Headers
    const headers = Object.assign({}, requestOpts.headers)
    if (requestOpts.json) {
      headers['Accept'] = 'application/json'
    }
    if (!headers['User-Agent']) {
      headers['User-Agent'] = this.USER_AGENT
    } else if (headers['User-Agent'].indexOf(this.USER_AGENT) === -1) {
      headers['User-Agent'] = headers['User-Agent'] + ' ' + this.USER_AGENT
    }

    // Converted options
    const fetchOpts = {
      headers: headers,
      method: method
    }

    if (method === 'GET') {
      const fullUrl = `${url}${requestOpts.qs ? '?' + qsLib.stringify(requestOpts.qs) : ''}`
      return window.fetch(fullUrl, fetchOpts)
    } else if (method === 'POST') {
      // Body
      if (requestOpts.form) {
        fetchOpts.body = qsLib.stringify(requestOpts.form)
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
        headers['Content-Length'] = fetchOpts.body.length
      } else if (requestOpts.qs) {
        if (requestOpts.json) {
          fetchOpts.body = JSON.stringify(requestOpts.qs)
          headers['Content-Type'] = 'application/json'
          headers['Content-Length'] = fetchOpts.body.length
        }
      }

      return window.fetch(url, fetchOpts)
    }
  }

  /**
   * Makes a request with given options and invokes callback.
   * @param opts={}: the options that are normally provided to nodejs request
   * @param callback=undefined: the callback to execute on success or failure
   */
  request (opts = {}, callback = undefined) {
    this.fetchWithNodeRequestParams(opts)
      .then((response) => {
        if (callback) {
          return response.text().then((body) => {
            return { read: true, response: response, body: body }
          })
        } else {
          return { read: false, response: response }
        }
      })
      .then(({ read, response, body }) => {
        if (!callback) { return }

        let err
        try {
          body = JSON.parse(body)
        } catch (err) { /* no op */ }

        if (body && body.error && response.status !== 200) {
          if (typeof body.error === 'string') {
            err = new Error(body.error)
            err.code = response.status
          } else if (Array.isArray(body.error.errors)) {
            err = new Error(body.error.errors.map((err) => err.message).join('\n'))
            err.code = body.error.code
            err.errors = body.error.errors
          } else {
            err = new Error(body.error.message)
            err.code = body.error.code || response.status
          }
          body = null
        } else if (response.status >= 500) {
          err = new Error(body)
          err.code = response.status
          body = null
        }

        callback(err, body, response)
      })
      .catch((err) => {
        if (!callback) { return }
        callback(err, undefined, undefined)
      })
  }
}

module.exports = GoogleHTTPTransporter

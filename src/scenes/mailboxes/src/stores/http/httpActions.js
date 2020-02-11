const alt = require('../alt')
const uuid = require('uuid')

class HttpActions {

  /* **************************************************************************/
  // Requests
  /* **************************************************************************/

  /**
  * Fetches text from a remote endpoint
  * @param url: the url of the license
  * @param config: the config for the fetch request if required
  * @return { id, promise, ... } tracking id
  */
  fetchText (url, config) {
    const id = uuid.v4()
    const promise = Promise.resolve()
      .then(() => window.fetch(url))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.text())
      .then((res) => {
        this.requestSuccess(id, res)
      }, (err) => {
        this.requestFailure(id, err)
      })

    return { id: uuid.v4(), promise: promise }
  }

  /**
  * Indicates a request ended in success
  * @param id: the id of the request
  * @param data: the data that was received
  */
  requestSuccess (id, data) {
    return { id: id, data: data }
  }

  /**
  * Indicates a request ended in failure
  * @param id: the id of the request
  * @param err: the error that occured
  */
  requestFailure (id, err) {
    return { id: id, error: err }
  }

  /* **************************************************************************/
  // Clearup
  /* **************************************************************************/

  /**
  * Clears the response
  * @param id: the id of the task
  */
  clearResponse (id) {
    return { id: id }
  }
}

module.exports = alt.createActions(HttpActions)

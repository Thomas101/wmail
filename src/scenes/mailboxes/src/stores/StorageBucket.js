const {ipcRenderer} = window.nativeRequire('electron')

class StorageBucket {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (bucketName) {
    this.__bucketName__ = bucketName
    this.__lastCallId__ = 0
    this.__responseHandlers__ = new Map()
    ipcRenderer.on(`storageBucket:${bucketName}:reply`, this._handleIPCReply.bind(this))
  }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * @return the next call id to use over the ipc
  */
  _nextCallId () {
    this.__lastCallId__++
    return this.__lastCallId__
  }

  /* ****************************************************************************/
  // IPC Response
  /* ****************************************************************************/

  /**
  * Handles the responses coming back over ipc
  * @param evt: the event that fired
  * @param body: the body of the reply
  */
  _handleIPCReply (evt, body) {
    if (this.__responseHandlers__.has(body.id)) {
      this.__responseHandlers__.get(body.id)(body)
      this.__responseHandlers__.delete(body.id)
    }
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * @param k: the key of the item
  * @param d=undefined: the default value if not exists
  * @return promise with the value
  */
  getItem (k, d) {
    return new Promise((resolve) => {
      const id = this._nextCallId()
      this.__responseHandlers__.set(id, (body) => {
        resolve(body.response || d)
      })

      ipcRenderer.send(`storageBucket:${this.__bucketName__}:getItem`, { id: id, key: k })
    })
  }

  /**
  * @param k: the key of the item
  * @param d=undefined: the default value if not exists
  * @return the value
  */
  getItemSync (k, d) {
    const body = ipcRenderer.sendSync(`storageBucket:${this.__bucketName__}:getItem`, { key: k, sync: true })
    return body.response || d
  }

  /**
  * @param k: the key of the item
  * @param d=undefined: the default value if not exists
  * @return promise with the value
  */
  getJSONItem (k, d) {
    return this.getItem(k).then((v) => Promise.resolve(v ? JSON.parse(v) : d))
  }

  /**
  * @param k: the key of the item
  * @param d=undefined: the default value if not exists
  * @return the value
  */
  getJSONItemSync (k, d) {
    const str = this.getItemSync(k, d)
    return str ? JSON.parse(str) : d
  }

  /**
  * @return promise with a list of all keys
  */
  allKeys () {
    return new Promise((resolve) => {
      const id = this._nextCallId()
      this.__responseHandlers__.set(id, (body) => {
        resolve(body.response)
      })

      ipcRenderer.send(`storageBucket:${this.__bucketName__}:allKeys`, { id: id })
    })
  }

  /**
  * @return all keys
  */
  allKeysSync () {
    return ipcRenderer.sendSync(`storageBucket:${this.__bucketName__}:allKeys`, { sync: true }).response
  }

  /**
  * @return promise with the items in an obj
  */
  allItems () {
    return new Promise((resolve) => {
      const id = this._nextCallId()
      this.__responseHandlers__.set(id, (body) => {
        resolve(body.response)
      })

      ipcRenderer.send(`storageBucket:${this.__bucketName__}:allItems`, { id: id })
    })
  }

  /**
  * @return all the items in an obj
  */
  allItemsSync () {
    return ipcRenderer.sendSync(`storageBucket:${this.__bucketName__}:allItems`, { sync: true }).response
  }

  /**
  * @return promise with the items in an obj
  */
  allJSONItems () {
    return this.allItems().then((items) => {
      const jsonItems = Object.keys(items).reduce((acc, key) => {
        acc[key] = JSON.parse(items[key])
        return acc
      }, {})
      return Promise.resolve(jsonItems)
    })
  }

  /**
  * @return all the items in an obj
  */
  allJSONItemsSync () {
    const items = this.allItemsSync()
    return Object.keys(items).reduce((acc, key) => {
      acc[key] = JSON.parse(items[key])
      return acc
    }, {})
  }

  /* ****************************************************************************/
  // Modifiers
  /* ****************************************************************************/

  /**
  * @param k: the key of the item
  * @param v: the value of the item
  * @return promise
  */
  setItem (k, v) {
    return new Promise((resolve) => {
      const id = this._nextCallId()
      this.__responseHandlers__.set(id, (body) => {
        resolve(body.response)
      })

      ipcRenderer.send(`storageBucket:${this.__bucketName__}:setItem`, { id: id, key: k, value: v })
    })
  }

  /**
  * @param k: the key of the item
  * @param v: the value of the item
  */
  setItemSync (k, v) {
    ipcRenderer.sendSync(`storageBucket:${this.__bucketName__}:setItem`, { key: k, value: v, sync: true })
  }

  /**
  * @param k: the key of the item
  * @param v: the json value of the item
  * @return promise
  */
  setJSONItem (k, v) {
    return this.setItem(k, JSON.stringify(v))
  }

  /**
  * @param k: the key of the item
  * @param v: the json value of the item
  * @return promise
  */
  setJSONItemSync (k, v) {
    this.setItemSync(k, JSON.stringify(v))
  }

  /**
  * @param k: the key of the item
  * @return promise
  */
  removeItem (k) {
    return new Promise((resolve) => {
      const id = this._nextCallId()
      this.__responseHandlers__.set(id, (body) => {
        resolve(body.response)
      })

      ipcRenderer.send(`storageBucket:${this.__bucketName__}:removeItem`, { id: id, key: k })
    })
  }

  /**
  * @param k: the key of the item
  */
  removeItemSync (k) {
    ipcRenderer.sendSync(`storageBucket:${this.__bucketName__}:removeItem`, { key: k, sync: true })
  }
}

module.exports = StorageBucket

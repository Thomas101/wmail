const {ipcMain} = require('electron')
const AppDirectory = require('appdirectory')
const pkg = require('../../package.json')
const mkdirp = require('mkdirp')
const path = require('path')
const Minivents = require('minivents')
const fs = require('fs-extra')
const writeFileAtomic = require('write-file-atomic')
const { DB_WRITE_DELAY_MS } = require('../../shared/constants')

// Setup
const appDirectory = new AppDirectory(pkg.name)
const dbPath = appDirectory.userData()
mkdirp.sync(dbPath)

class StorageBucket {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (bucketName) {
    this.__path__ = path.join(dbPath, bucketName + '_db.json')
    this.__writeHold__ = null
    this.__writeLock__ = false
    this.__data__ = undefined
    this.__ipcReplyChannel__ = `storageBucket:${bucketName}:reply`

    this._loadFromDiskSync()

    ipcMain.on(`storageBucket:${bucketName}:setItem`, this._handleIPCSetItem.bind(this))
    ipcMain.on(`storageBucket:${bucketName}:removeItem`, this._handleIPCRemoveItem.bind(this))
    ipcMain.on(`storageBucket:${bucketName}:getItem`, this._handleIPCGetItem.bind(this))
    ipcMain.on(`storageBucket:${bucketName}:allKeys`, this._handleIPCAllKeys.bind(this))
    ipcMain.on(`storageBucket:${bucketName}:allItems`, this._handleIPCAllItems.bind(this))

    Minivents(this)
  }

  checkAwake () { return true }

  /* ****************************************************************************/
  // Persistence
  /* ****************************************************************************/

  /**
  * Loads the database from disk
  */
  _loadFromDiskSync () {
    let data = '{}'
    try {
      data = fs.readFileSync(this.__path__, 'utf8')
    } catch (ex) { }

    try {
      this.__data__ = JSON.parse(data)
    } catch (ex) {
      this.__data__ = {}
    }
  }

  /**
  * Writes the current data to disk
  */
  _writeToDisk () {
    clearTimeout(this.__writeHold__)
    this.__writeHold__ = setTimeout(() => {
      if (this.__writeLock__) {
        // Requeue in DB_WRITE_DELAY_MS
        this._writeToDisk()
        return
      } else {
        this.__writeLock__ = true
        writeFileAtomic(this.__path__, JSON.stringify(this.__data__), 'utf8', () => {
          this.__writeLock__ = false
        })
      }
    }, DB_WRITE_DELAY_MS)
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * @param k: the key of the item
  * @param d=undefined: the default value if not exists
  * @return the string item or d
  */
  getItem (k, d) {
    const json = this.__data__[k]
    return json || d
  }

  /**
  * @param k: the key of the item
  * @param d=undefined: the default value if not exists
  * @return the string item or d
  */
  getJSONItem (k, d) {
    const item = this.getItem(k)
    try {
      return item ? JSON.parse(item) : d
    } catch (ex) {
      return {}
    }
  }

  /**
  * @return a list of all keys
  */
  allKeys () {
    return Object.keys(this.__data__)
  }

  /**
  * @return all the items in an obj
  */
  allItems () {
    return this.allKeys().reduce((acc, key) => {
      acc[key] = this.getItem(key)
      return acc
    }, {})
  }

  /**
  * @return all the items in an obj json parsed
  */
  allJSONItems () {
    return this.allKeys().reduce((acc, key) => {
      acc[key] = this.getJSONItem(key)
      return acc
    }, {})
  }

  /* ****************************************************************************/
  // Modifiers
  /* ****************************************************************************/

  /**
  * @param k: the key to set
  * @param v: the value to set
  * @return v
  */
  _setItem (k, v) {
    this.__data__[k] = '' + v
    this._writeToDisk()
    this.emit('changed', { type: 'setItem', key: k })
    this.emit('changed:' + k, { })
    return v
  }

  /**
  * @param k: the key to remove
  */
  _removeItem (k) {
    delete this.__data__[k]
    this._writeToDisk()
    this.emit('changed', { type: 'removeItem', key: k })
    this.emit('changed:' + k, { })
  }

  /* ****************************************************************************/
  // IPC Access
  /* ****************************************************************************/

  /**
  * Responds to an ipc message
  * @param evt: the original event that fired
  * @param response: teh response to send
  * @param sendSync: set to true to respond synchronously
  */
  _sendIPCResponse (evt, response, sendSync = false) {
    if (sendSync) {
      evt.returnValue = response
    } else {
      evt.sender.send(this.__ipcReplyChannel__, response)
    }
  }

  /**
  * Sets an item over IPC
  * @param evt: the fired event
  * @param body: request body
  */
  _handleIPCSetItem (evt, body) {
    this._setItem(body.key, body.value)
    this._sendIPCResponse(evt, { id: body.id, response: null }, body.sync)
  }

  /**
  * Removes an item over IPC
  * @param evt: the fired event
  * @param body: request body
  */
  _handleIPCRemoveItem (evt, body) {
    this._removeItem(body.key)
    this._sendIPCResponse(evt, { id: body.id, response: null }, body.sync)
  }

  /**
  * Gets an item over IPC
  * @param evt: the fired event
  * @param body: request body
  */
  _handleIPCGetItem (evt, body) {
    this._sendIPCResponse(evt, {
      id: body.id,
      response: this.getItem(body.key)
    }, body.sync)
  }

  /**
  * Gets the keys over IPC
  * @param body: request body
  */
  _handleIPCAllKeys (evt, body) {
    this._sendIPCResponse(evt, {
      id: body.id,
      response: this.allKeys()
    }, body.sync)
  }

  /**
  * Gets all the items over IPC
  * @param body: request body
  */
  _handleIPCAllItems (evt, body) {
    this._sendIPCResponse(evt, {
      id: body.id,
      response: this.allItems()
    }, body.sync)
  }
}

module.exports = StorageBucket

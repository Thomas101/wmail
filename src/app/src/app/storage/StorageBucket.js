const AppDirectory = require('appdirectory')
const pkg = require('../../package.json')
const mkdirp = require('mkdirp')
const path = require('path')
const Minivents = require('minivents')
const fs = require('fs-extra')
const { DB_BACKUP_INTERVAL_MS, DB_WRITE_DELAY_MS } = require('../../shared/constants')

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
    this.__backupPath__ = this.__path__ + 'b'
    this.__writer__ = null
    this.__data__ = undefined

    // Setup backup infrastructure
    this._restoreBackup()
    this.autoBackup = setInterval(() => {
      this._performBackup()
    }, DB_BACKUP_INTERVAL_MS + (Math.floor(Math.random() * 10000)))

    this._loadFromDisk()

    Minivents(this)
  }

  /* ****************************************************************************/
  // Backup
  /* ****************************************************************************/

  /**
  * Attempts to restore the backup if required
  * @return true if a backup was performed successfully
  */
  _restoreBackup () {
    let restoreBackup = false
    let didPerform = false
    try {
      const data = fs.readFileSync(this.__path__, 'utf-8')
      if (!data.length) {
        restoreBackup = true
      }
    } catch (ex) {
      restoreBackup = true
    }

    if (restoreBackup) {
      try {
        fs.copySync(this.__backupPath__, this.__path__)
        didPerform = true
      } catch (ex) { }
    }

    return didPerform
  }

  /**
  * Backs up the data
  */
  _performBackup () {
    let data = ''
    try {
      data = fs.readFileSync(this.__path__, 'utf8')
    } catch (ex) { }

    if (data.length) {
      fs.outputFileSync(this.__backupPath__, data)
    }
  }

  /* ****************************************************************************/
  // Persistence
  /* ****************************************************************************/

  /**
  * Loads the database from disk
  */
  _loadFromDisk () {
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
    clearTimeout(this.__writer__)
    this.__writer__ = setTimeout(() => {
      fs.writeFileSync(this.__path__, JSON.stringify(this.__data__), 'utf8')
    }, DB_WRITE_DELAY_MS)
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * @param k: the key of the item
  * @param d=undefined: the default value if not exists
  * @return the json item or d
  */
  getItem (k, d) {
    const json = this.__data__[k]
    return json ? JSON.parse(json) : d
  }

  /**
  * @param k: the key of the item
  * @param d=undefined: the default value if not exists
  * @return the string item or d
  */
  getString (k, d) {
    const json = this.__data__[k]
    return json || d
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
  * @return all the items in an obj
  */
  allStrings () {
    return this.allKeys().reduce((acc, key) => {
      acc[key] = this.getString(key)
      return acc
    }, {})
  }

  /* ****************************************************************************/
  // Setters
  /* ****************************************************************************/

  /**
  * @param k: the key to set
  * @param v: the value to set
  * @return v
  */
  setItem (k, v) {
    this.__data__[k] = JSON.stringify(v)
    this._writeToDisk()
    this.emit('changed', { type: 'setItem', key: k })
    this.emit('changed:' + k, { })
    return v
  }

  /**
  * @param k: the key to set
  * @param s: the value to set
  * @return s
  */
  setString (k, s) {
    this.__data__[k] = s
    this._writeToDisk()
    this.emit('changed', { type: 'setString', key: k })
    this.emit('changed:' + k, { })
    return s
  }

  /* ****************************************************************************/
  // Removers
  /* ****************************************************************************/

  /**
  * @param k: the key to remove
  */
  removeItem (k) {
    delete this.__data__[k]
    this._writeToDisk()
    this.emit('changed', { type: 'removeItem', key: k })
    this.emit('changed:' + k, { })
  }
}

module.exports = StorageBucket

const AppDirectory = require('appdirectory')
const pkg = require('../../package.json')
const mkdirp = require('mkdirp')
const Storage = require('dom-storage')
const path = require('path')
const Minivents = require('minivents')

// Setup
const appDirectory = new AppDirectory(pkg.name)
const dbPath = appDirectory.userData()
mkdirp.sync(dbPath)

class StorageBucket {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (bucketName) {
    this.__storage__ = new Storage(path.join(dbPath, bucketName + '_db.json'))
    Minivents(this)
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
    const json = this.__storage__.getItem(k)
    return json ? JSON.parse(json) : d
  }

  /**
  * @param k: the key of the item
  * @param d=undefined: the default value if not exists
  * @return the string item or d
  */
  getString (k, d) {
    const json = this.__storage__.getItem(k)
    return json || d
  }

  /**
  * @return a list of all keys
  */
  allKeys () {
    const keys = []
    for (let i = 0; i < this.__storage__.length; i++) {
      keys.push(this.__storage__.key(i))
    }
    return keys
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
    this.__storage__.setItem(k, JSON.stringify(v))
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
    this.__storage__.setItem(k, s)
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
    this.__storage__.removeItem(k)
    this.emit('changed', { type: 'removeItem', key: k })
    this.emit('changed:' + k, { })
  }
}

module.exports = StorageBucket

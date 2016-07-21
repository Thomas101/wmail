const StorageBucket = require('./StorageBucket')

class StorageBucketAppMutable extends StorageBucket {
  /**
  * @param k: the key to set
  * @param v: the value to set
  * @return v
  */
  setItem (k, v) { return this._setItem(k, v) }

  /**
  * @param k: the key to set
  * @param v: the value to set
  * @return v
  */
  setJSONItem (k, v) { return this._setItem(k, JSON.stringify(v)) }

  /**
  * @param k: the key to remove
  */
  removeItem (k) { return this._removeItem(k) }
}

module.exports = StorageBucketAppMutable

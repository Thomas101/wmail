class Model {

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (data) {
    this.__data__ = Object.freeze(JSON.parse(JSON.stringify(data)))
  }

  /* **************************************************************************/
  // Cloning
  /* **************************************************************************/

  /**
  * Clones a copy of the data
  * @return a new copy of the data copied deeply.
  */
  cloneData () {
    return JSON.parse(JSON.stringify(this.__data__))
  }

  /**
  * Clones the data and merges the given changeset
  * @param changeset: { k->v } to merge. Only 1 level deep
  */
  changeData (changeset) {
    return Object.assign(this.cloneData(), changeset)
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * @param the key to get
  * @param defaultValue: the value to return if undefined
  * @return the value or defaultValue
  */
  _value_ (key, defaultValue) {
    return this.__data__[key] === undefined ? defaultValue : this.__data__[key]
  }
}

module.exports = Model

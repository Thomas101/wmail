module.exports = {
  get: function (k, d) {
    return window.localStorage[k] === undefined ? d : JSON.parse(window.localStorage[k])
  },
  set: function (k, v) {
    window.localStorage[k] = JSON.stringify(v)
    return v
  },
  remove: function (k) {
    delete window.localStorage[k]
  }
}

const Minivents = require('minivents')

class NavigationDispatch {
  /**
  * Emits an open settings command
  */
  openSettings () {
    this.emit('opensettings', {})
  }

}

const navigationDispatch = new NavigationDispatch()
Minivents(navigationDispatch)
module.exports = navigationDispatch

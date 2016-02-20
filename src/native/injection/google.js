;(function () {
  'use strict'

  require('./keyboardNavigation')
  require('./clickReport')
  require('./zoomLevel')
  require('./googleWindowOpen')
  require('./googleNotifications')
  const contextMenu = require('./contextMenu')
  require('./spellchecker')((provider) => {
    contextMenu.spellcheckProvider = provider
  })
})()

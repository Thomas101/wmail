;(function () {
  'use strict'

  require('./keyboardNavigation')
  require('./clickReport')
  require('./zoomLevel')
  require('./googleWindowOpen')
  const contextMenu = require('./contextMenu')
  require('./spellchecker')(provider => {
    contextMenu.spellcheckProvider = provider
  })
})()

;(function () {
  'use strict'

  require('./clickReport')
  require('./zoomLevel')
  require('./googleWindowOpen')
  const contextMenu = require('./contextMenu')
  require('./spellchecker')(provider => {
    contextMenu.spellcheckProvider = provider
  })
})()

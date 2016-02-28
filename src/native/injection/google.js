;(function () {
  'use strict'

  require('./keyboardNavigation')
  require('./clickReport')
  require('./zoomLevel')
  require('./googleWindowOpen')

  const enUS = require('dictionary-en-us')
  const Spellchecker = require('nodehun')
  enUS((err, result) => {
    if (!err) {
      const spellchecker = new Spellchecker(result.aff, result.dic)
      require('./spellchecker')(spellchecker)
      require('./contextMenu')(spellchecker)
    } else {
      require('./contextMenu')(null)
    }
  })
})()

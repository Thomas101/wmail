;(function () {
  'use strict'

  document.addEventListener('keydown', function (evt) {
    if (evt.keyCode === 8) { // Backspace

      // Look for reasons to cancel
      if (evt.target.tagName === 'INPUT') { return }
      if (evt.target.tagName === 'TEXTAREA') { return }
      if (evt.target.tagName === 'SELECT') { return }
      if (evt.target.tagName === 'OPTION') { return }
      if (evt.path.findIndex(e => e.getAttribute && e.getAttribute('contentEditable') === 'true') !== -1) { return }

      window.history.back()
    }
  }, false)
})()

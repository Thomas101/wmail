;(function () {
  'use strict'

  delete window.Notification
  document.addEventListener('DOMContentLoaded', function () {
    const frames = document.querySelectorAll('iframe')
    for (let i = 0; i < frames.length; i++) {
      try {
        delete frames[i].contentWindow.Notification
      } catch (ex) { }
    }
  }, false)
})()

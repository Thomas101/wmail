'use strict'

const fetch = require('node-fetch')
const constants = require('../shared/constants')
const pkg = require('../package.json')
const dialog = require('electron').dialog
const shell = require('shell')
const compareVersion = require('compare-version')

class Update {
  /**
  * Checks to see if there is an update
  */
  checkNow (window) {
    fetch(constants.UPDATE_CHECK_URL).then((res) => {
      return res.json()
    }).then((json) => {
      const newRelease = json.find(release => {
        let tag = release.tag_name
        tag = tag.indexOf('v' === 0) ? tag.substr(1) : tag
        return pkg.prerelease === release.prerelease && compareVersion(tag, pkg.version) >= 1
      })

      if (newRelease) {
        let tag = newRelease.tag_name
        tag = tag.indexOf('v' === 0) ? tag.substr(1) : tag
        dialog.showMessageBox(window, {
          type: 'question',
          title: 'Updates Available',
          message: 'Version ' + tag + ' is now available. Do you want to download it now?',
          buttons: ['Download Now', 'Download Later'],
          defaultId: 1
        }, (response) => {
          if (response === 0) {
            shell.openExternal(constants.GITHUB_URL)
          }
        })
      }
    })
  }
}

module.exports = new Update()

"use strict"

const fetch = require('node-fetch')
const constants = require('./constants')
const pkg = require('../package.json')
const dialog = require('electron').dialog;
const shell = require('shell')
const compareVersion = require('compare-version')

class Update {
	/**
	* Checks to see if there is an update
	*/
	checkNow(window) {
		fetch(constants.UPDATE_CHECK_URL).then((res) => {
			return res.json()
		}).then((json) => {
			let latestTag = json[0].tag_name
			latestTag = latestTag.indexOf('v' === 0) ? latestTag.substr(1) : latestTag
			if (compareVersion(latestTag, pkg.version) >= 1) {
				dialog.showMessageBox(window, {
					type: 'question',
					title:'Updates Available',
					message:'An update is available. Do you want to download it now?',
					buttons: ['Download Now', 'Download Later'],
					defaultId: 1,
				}, (response) => {
					if (response === 0) {
						shell.openExternal(json.download_url)
					}
				})
			}
		})
	}
}

module.exports = new Update()
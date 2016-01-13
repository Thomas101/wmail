"use strict"

const AppDirectory = require('appdirectory')
const LocalStorage = require('node-localstorage').LocalStorage
const pkg = require('../package.json')
const uuid = require('./uuid')
const fetch = require('node-fetch')
const credentials = require('./credentials')

const appDirectory = new AppDirectory(pkg.name)
const localStorage = new LocalStorage(appDirectory.userData());


class Analytics {
	/*****************************************************************************/
	// Lifecycle
	/*****************************************************************************/
	constructor() {
		if (!localStorage.getItem('ga-id')) {
			localStorage.setItem('ga-id', uuid.uuid4())
		}
		this.id = localStorage.getItem('ga-id')
	}

	/*****************************************************************************/
	// Events Lifecycle
	/*****************************************************************************/

	/**
	* Log the app was opened
	*/
	appOpened() {
		if (!credentials.GOOGLE_ANALYTICS_ID) { return }
		const args = {
			v 				: 1,
			tid 			: credentials.GOOGLE_ANALYTICS_ID,
			cid 			: this.id,
			t 				: 'pageview',
			dp 				: '/open/' + pkg.version,
			dt 				: 'open'
		}
		const qs = Object.keys(args).reduce((acc, k) => {
			acc.push(k + '=' + encodeURIComponent(args[k]))
			return acc
		}, []).join('&')
		const url = 'https://www.google-analytics.com/collect?' + qs
		fetch(url, { method: 'post' })
	}

	/**
	* Log the app is alive
	*/
	appHeartbeat() {
		if (!credentials.GOOGLE_ANALYTICS_ID) { return }
		const args = {
			v 				: 1,
			tid 			: credentials.GOOGLE_ANALYTICS_ID,
			cid 			: this.id,
			t 				: 'pageview',
			dp 				: '/heartbeat/' + pkg.version,
			dt 				: 'heartbeat'
		}
		const qs = Object.keys(args).reduce((acc, k) => {
			acc.push(k + '=' + encodeURIComponent(args[k]))
			return acc
		}, []).join('&')
		const url = 'https://www.google-analytics.com/collect?' + qs
		fetch(url, { method: 'post' })
	}
}

module.exports = new Analytics()
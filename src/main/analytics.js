"use strict"

const AppDirectory = require('appdirectory')
const LocalStorage = require('node-localstorage').LocalStorage
const pkg = require('../package.json')
const uuid = require('../shared/uuid')
const fetch = require('node-fetch')
const credentials = require('../shared/credentials')
const constants = require('../shared/constants')

const appDirectory = new AppDirectory(pkg.name)
const localStorage = new LocalStorage(appDirectory.userData())
const osLanguage = require('os-locale').sync()


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
	* @param window: the mailbox window
	* @param args: the items to append
	* @return the querystring with all arguments setup
	*/
	send(window, args) {
		const full_args = Object.assign({
			v 				: 1,
			tid 			: credentials.GOOGLE_ANALYTICS_ID,
			cid 			: this.id,
			t 				: 'pageview',
			vp 				: window.getSize().join('x'),
			ul 				: osLanguage,
			ua 				: window.webContents.getUserAgent()
		}, args)

		const qs = Object.keys(full_args).reduce((acc, k) => {
			acc.push(k + '=' + encodeURIComponent(full_args[k]))
			return acc
		}, []).join('&')

		const url = 'https://www.google-analytics.com/collect?' + qs
		return fetch(url, { method: 'post' })
	}

	/**
	* Log the app was opened
	* @param window: the mailbox window
	*/
	appOpened(window) {
		if (!credentials.GOOGLE_ANALYTICS_ID) { return Promise.resolve() }
		return this.send(window, {
			dp 				: '/open/' + pkg.version,
			dt 				: 'open'
		})
	}

	/**
	* Log the app is alive
	* @param window: the mailbox window
	*/
	appHeartbeat(window) {
		if (!credentials.GOOGLE_ANALYTICS_ID) { return Promise.resolve() }
		return this.send(window, {
			dp 				: '/heartbeat/' + pkg.version,
			dt 				: 'heartbeat'
		})
	}

	/**
	* Log an exception
	* @param window: the mailbox window
	* @param thread: the thread that it occured on
	* @param error: the error that was thrown
	*/
	appException(window, thread, error) {
		if (!credentials.GOOGLE_ANALYTICS_ID) { return Promise.resolve() }
		return this.send(window, {
			dp 				: '/error/' + pkg.version,
			dt 				: 'error',
			t 				: 'exception',
			exd 			: '[' + thread + ']' + error.toString()
		})
	}
}

module.exports = new Analytics()
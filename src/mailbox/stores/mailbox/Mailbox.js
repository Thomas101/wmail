const uuid = require('shared/uuid')

class Mailbox {
	/***************************************************************************/
	// Lifecycle
	/***************************************************************************/

	constructor(id, data) {
		this.__id__ = id
		this.__data__ = data
	}

	static provisionId() { return uuid.uuid4() }

	/***************************************************************************/
	// Properties
	/***************************************************************************/
	get id() { return this.__id__; }
	get type() { return this.__data__.type || 'ginbox'; }
	get url() {
		switch(this.type) {
			case 'ginbox': return 'https://inbox.google.com'
			case 'gmail': return 'https://mail.google.com?ibxr=0'
			default: return undefined
		}
	}

	/***************************************************************************/
	// Properties : Options
	/***************************************************************************/

	get zoomFactor() { return this.__data__.zoomFactor === undefined ? 1.0 : this.__data__.zoomFactor }

	/***************************************************************************/
	// Properties : Account Details
	/***************************************************************************/

	get avatar() { return this.__data__.avatar; }
	get email() { return this.__data__.email; }
	get name() { return this.__data__.name; }
	get unread() { return this.__data__.unread; }

	/***************************************************************************/
	// Properties : Google Auth
	/***************************************************************************/

	get googleAuth() { return this.__data__.googleAuth; }
	get googleAuthTime() { return (this.googleAuth || {}).date; }
	get hasGoogleAuth() { return this.googleAuth !== undefined; }
	get googleAccessToken() { return (this.googleAuth || {}).access_token; }
	get googleRefreshToken() { return (this.googleAuth || {}).refresh_token; }
	get googleAuthExpiryTime() { return ((this.googleAuth || {}).date || 0) + ((this.googleAuth || {}).expires_in || 0) }
}

module.exports = Mailbox
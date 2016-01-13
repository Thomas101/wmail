#Wmail

A Mac app wrapper around Google Inbox and GMail. Multiple account support, unread notifications and more. Makes using Google Mailboxes feel that little more native on osx.

[Download the latest version (1.1.0)](https://raw.githubusercontent.com/Thomas101/wmail/master/release/WMail_latest.zip)

[Raise an issue or request a feature](https://github.com/Thomas101/wmail/issues)

![Screenshot](https://raw.githubusercontent.com/Thomas101/wmail/master/screenshot.png "Screenshot")

### Building from source
Feeling brave and want to build from source? Here's what you need to do

Firstly you need to get a client id and secret from Google. Visit https://console.developers.google.com to get started. You'll need to setup your OAuth Client ID and enable the Gmail, Google+ and Identity Toolkit APIs.

Next create `credentials.js` with your google client id and secret like so...

```js
module.exports = Object.freeze({
	GOOGLE_CLIENT_ID : '<Your google client id>',
	GOOGLE_CLIENT_SECRET: '<Your google client secret>'
})
```

Then run the following...

```
npm install
npm start
```

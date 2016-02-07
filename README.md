#Wmail

The missing desktop client for Gmail & Google Inbox. Bringing the Gmail & Google Inbox experience to your desktop in a neatly packaged app

[Download the latest version (1.1.3)](https://github.com/Thomas101/wmail/releases/download/v1.1.3/WMail_1_1_3.zip)

Download the latest pre-release for your platform (1.1.8) 

* [Download for OSX](https://github.com/Thomas101/wmail/releases/download/v1.1.8/WMail_1_1_8_osx_prerelease.zip)
* [Download for linux 32-bit](https://github.com/Thomas101/wmail/releases/download/v1.1.8/WMail_1_1_8_linux32_prerelease.zip)
* [Download for linux 64-bit](https://github.com/Thomas101/wmail/releases/download/v1.1.8/WMail_1_1_8_linux64_prerelease.zip.zip)

[View all releases](https://github.com/Thomas101/wmail/releases)

[Raise an issue or request a feature](https://github.com/Thomas101/wmail/issues)

[Find out how you can contribute](https://github.com/Thomas101/wmail/wiki/Contributing)

![Screenshot](https://raw.githubusercontent.com/Thomas101/wmail/master/github_images/screenshot1.png "Screenshot")


### Building from source

[![Travis Build Status](https://img.shields.io/travis/Thomas101/wmail.svg)](http://travis-ci.org/Thomas101/wmail)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Feeling brave and want to build from source? Here's what you need to do

Firstly you need to get a client id and secret from Google. Visit https://console.developers.google.com to get started. You'll need to setup your OAuth Client ID and enable the Gmail, Google+ and Identity Toolkit APIs.

Next create `src/shared/credentials.js` with your google client id and secret like so...

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



Made with ♥ by Thomas Beverley. [Buy me a beer](https://www.paypal.me/ThomasBeverley) &#127866;

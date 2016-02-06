#Wmail

A Mac app wrapper around Google Inbox and GMail. Multiple account support, unread notifications and more. Makes using Google Mailboxes feel that little more native on osx.

[Download the latest version (1.1.3)](https://github.com/Thomas101/wmail/releases/download/v1.1.3/WMail_1_1_3.zip)

Download the latest pre-release for your platform (1.1.8) 

* [Download for OSX](https://github.com/Thomas101/wmail/releases/download/v1.1.8/WMail_1_1_8_osx_prerelease.zip)
* [Download for linux 32-bit](https://github.com/Thomas101/wmail/releases/download/v1.1.8/WMail_1_1_8_linux32_prerelease.zip)
* [Download for linux 64-bit](https://github.com/Thomas101/wmail/releases/download/v1.1.8/WMail_1_1_8_linux64_prerelease.zip.zip)

[View all releases](https://github.com/Thomas101/wmail/releases)

[Raise an issue or request a feature](https://github.com/Thomas101/wmail/issues)

![Screenshot](https://raw.githubusercontent.com/Thomas101/wmail/master/github_images/screenshot1.png "Screenshot")

### Installing
WMail should work just by running it like any other app. If you have Gatekeeper enabled on your mac you will need to make an exception to run the WMail app the first time. Here are some instructions if you're unsure how to get started

1.) After downloading the app, unzip it if your browser hasn't already done it automatically.

2.) Drag WMail into your applications folder

<a href="https://raw.githubusercontent.com/Thomas101/wmail/master/github_images/setup1.png" target="_blank"><img src="https://raw.githubusercontent.com/Thomas101/wmail/master/github_images/setup1.png" height="250" /></a>

3.) Depending on your configuration Gatekeeper may prevent you from opening the app by just double clicking on it the first time. This is because it will be from an unidentifier developer. Instead, right click on the app and select open

<a href="https://raw.githubusercontent.com/Thomas101/wmail/master/github_images/setup2.png" target="_blank"><img src="https://raw.githubusercontent.com/Thomas101/wmail/master/github_images/setup2.png" height="250" /></a>

4.) You'll see a warning explaining this to you. If you press open the app will open.

<a href="https://raw.githubusercontent.com/Thomas101/wmail/master/github_images/setup3.png" target="_blank"><img src="https://raw.githubusercontent.com/Thomas101/wmail/master/github_images/setup3.png" height="250" /></a>

5.) Once you've done this the first time you'll be able to launch the app from applications at any time by double clicking on it

### Screenshots
A few more screenshots to tickle your tastebuds

<a href="https://raw.githubusercontent.com/Thomas101/wmail/master/github_images/screenshot1.png" target="_blank"><img src="https://raw.githubusercontent.com/Thomas101/wmail/master/github_images/screenshot1.png" height="250" /></a><a href="https://raw.githubusercontent.com/Thomas101/wmail/master/github_images/screenshot2.png" target="_blank"><img src="https://raw.githubusercontent.com/Thomas101/wmail/master/github_images/screenshot2.png" height="250" /></a><a href="https://raw.githubusercontent.com/Thomas101/wmail/master/github_images/screenshot3.png" target="_blank"><img src="https://raw.githubusercontent.com/Thomas101/wmail/master/github_images/screenshot3.png" height="250" /></a>


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



Made with ♥ by Thomas Beverley. [Buy me a beer &#127866;](https://www.paypal.me/ThomasBeverley)

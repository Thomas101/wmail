# Wmail

[![Join the chat at https://gitter.im/wmail-desktop/Lobby](https://badges.gitter.im/wmail-desktop/Lobby.svg)](https://gitter.im/wmail-desktop/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Travis Build Status](https://img.shields.io/travis/Thomas101/wmail.svg)](http://travis-ci.org/Thomas101/wmail)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.me/ThomasBeverley)


The missing desktop client for Gmail & Google Inbox. Bringing the Gmail & Google Inbox experience to your desktop in a neatly packaged app

[Download the latest release](http://thomas101.github.io/wmail/download)

[View all releases](https://github.com/Thomas101/wmail/releases)

[Raise an issue or request a feature](https://github.com/Thomas101/wmail/issues)

[Find out how you can contribute](https://github.com/Thomas101/wmail/wiki/Contributing)

![Screenshot](https://raw.githubusercontent.com/Thomas101/wmail/master/github_images/screenshot1.png "Screenshot")


### Building from source

Feeling brave and want to build from source? Here's what you need to do

Firstly you need to get an OAuth client ID and secret from Google.
Visit https://console.developers.google.com to get started.
You'll need to [setup your OAuth Client ID](https://console.developers.google.com/apis/credentials) and enable the [Gmail](https://console.developers.google.com/apis/api/gmail/overview), [Google+](https://console.developers.google.com/apis/api/plus/overview) and [Identity Toolkit](https://console.developers.google.com/apis/api/identitytoolkit/overview) APIs.

To create OAuth client ID & secret, under "API Manager", choose "Create Credentials", then "OAuth client ID".
For "Application type", select "Other", and choose some name for the application, as described in these screenshots:

![Create credentials](https://raw.githubusercontent.com/Thomas101/wmail/master/github_images/gdc-create-credentials.png "Create Credentials")
![Create OAuth client ID](https://raw.githubusercontent.com/Thomas101/wmail/master/github_images/gdc-oauth-client-id-creation.png "Create OAuth Client ID")

Next create `src/shared/credentials.js` with your Google client ID and secret like so...

```js
module.exports = Object.freeze({
	GOOGLE_CLIENT_ID : '<Your google client id>',
	GOOGLE_CLIENT_SECRET: '<Your google client secret>'
})
```

Then run the following...

```
npm install webpack -g
npm run-script install-all
npm start
```

### Packaging Builds

To package builds. (Note packaging osx builds can only be done from osx)
```
brew install msitools
npm install
npm rebuild
npm run-script package
```


Made with ♥ by Thomas Beverley. [Buy me a beer](https://www.paypal.me/ThomasBeverley) &#127866;

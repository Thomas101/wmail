This release contains some fixes over the previous prerelease. A huge thanks to everyone who`s been reporting bugs and raising pull requests! Some features (such as services) have not yet made it into the release channel and continue to be prerelease only.

- Upgraded electron to 1.6.1
- Upgraded other libraries
- Fixed crash on exit (osx)
- Proxy server now automatically uses the same configuration as chrome, so unread counts and notifications should just work without any proxy configuration
- Removed DOM scraping from Google Inbox, but replaced it with a better API query that should provide better notifications and unread counts
- Clicking the tray icon on windows now focuses the WMail window
- Opening a mailto link now makes sure the WMail window is focused when using multiple desktops
- Relaxed the version requirements for `libappindicator1` for linux distributions that still use version `4.*.*`
- Removed the long description for sub-processes on windows
- Added Google Hangouts service (Thanks to @inikolaev for the pull request)
- Added `Cmd+Ctrl+{` and `Cmd+Ctrl+}` global shortcuts to switch accounts in a similar way to chrome (Thanks to @theRealWardo for the pull request)
- Added some more information to the sleepable settings to make it clearer what they do (Thanks to @gkatsev for the pull request)
- Added WMail News

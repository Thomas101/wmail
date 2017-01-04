New year, new features! This release contains a number of usability fixes as well as some long-requested features. **Extra tester points** if you test adding accounts with the new account wizard

# Features
- Added Google Services support (Drive, Calendar, Contacts and Keep) #106
- Added Mailto link handling on windows and osx #66 #465
- Added Mailto link handling from command line
- Added compose into tray icon #420
- Added configuration wizards when adding Mailboxes
- Added app setup wizard
- Check unread count updates more reliably by reading changes the DOM
- Better tooltips on side list items and accounts
- Improved welcome screen
- Added ability to take unread count from Google Inbox account UI which resolves the issue of bundled messages appearing in the unread counts

# Fixes
- Fixed deluge of emails on launch #430
- Fixed dragging images out of the window making the app clear down #456
- Disabled dragging images from sidebar #468

# Code
- Dependency updates
- Refactored the google sync store to remove race condition
- Added desktop file into linux tar builds

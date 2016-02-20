This is a pre-release version packed full of your 5 fruit and veg a day. Thanks to everyone who's been testing, finding bugs, collaborating and sending code fixes!

There is a breaking change in this release which means your unread mode will be reset. Simply set it to the desired value again you should be fine.

A big thanks to @itamaro for updating the build instructions for anyone else out there who wants to build Wmail from source

# Features
- You can now hide and show the sidebar thanks to @alexweber 
- The unread count is updated in a more responsive way
- Notifications have been overhauled
 - Notifications now show subject and sender
 - Option to disable notification sound
 - Option to disable notifications completely
 - Notifications no longer trigger on messages more that 2 days old stopping an onslaught the first time you launch the app
 - Notifications no longer trigger when you press `mark as unread` in gmail
- Added an option for accounts not add unread count to app unread
- Menu and keyboard shortcuts for re-opening menus (cmd+n)
- Menu and keyboard shortcut for preferences
- Updated electron to the latest version for bug fixes and performance
- Support for dark menubar on OSX
- Services menu in menubar
- Ability to set default download location
- Custom account images
- Open link in background appears in right click menu

# Bugs
- Notifications were a bit wibbly-wobbly, these should be much better now
- Switching account through the app menu or keyboard shortcut now makes sure the app is focused and visible
- Changed spellcheck library because of performance issues

# Code
- Updated settings screen for accounts to remove duplicated code
- Reduced API quota usage with google by optimising http calls
- Updated build dependencies
- Updated permission denial to use official API in latest electron rather than hack we used to use for Google


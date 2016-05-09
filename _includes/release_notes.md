This is a small release with some bugfixes and performance improvements. Nonetheless, you should totally upgrade. It still contains all the awesome from all the previous releases.

# Bugs
* Fixed an issue where the app would crash when a default download location was set
* Refactored the colorpickers to use a newer version of the code

# Code
* Updated material-ui to stable 0.15
* Ensured code optimisation was enabled when building react

--

#### Here's a recap what was new in the last major version (worth a mention as this is such a small one!)

## Features
* **Windows Support**

* Settings
 * You can now hide and show the sidebar thanks to @alexweber
 * Added an option for accounts not add unread count to app unread
 * Ability to set default download location
 * Custom account images
 * Open link in background appears in right click menu
 * Toggle menu bar linux, thanks to @jamesbvaughan
 * Option to open links in background
 * Tray icon color picker
 * You can now change your account colour in the side menu
 * The settings dialog has been tidied up a little

* Notifications & Unread counts
 * The unread count is updated in a more responsive way
 * Notifications now show subject and sender
 * Option to disable notification sound
 * Option to disable notifications completely
 * Notifications no longer trigger on messages more that 2 days old stopping an onslaught the first time you launch the app
 * Notifications no longer trigger when you press mark as unread in gmail
 * Unread count in tray icon

* Platform Integration
 * Menu and keyboard shortcuts for re-opening menus (cmd+n)
 * Menu and keyboard shortcut for preferences
 * Support for dark menubar on OSX
 * Services menu in menubar
 * Keep the app open on linux after closing main window thanks to @russiancow
 * Dragging the black sidebar now drags the window

* Updated electron to the latest version for bug fixes and performance
* Updated a bunch of libraries and framework for better stability and latest security fixes etc

## Bugs 🐛🐛🐛
* @dkuntz2 fixed the white border around avatars
* Unread messages in notification area no longer show stale messages
* Unread messages are now auto-synced when the unread count changes so notification system feels more responsive.
* Notifications were a bit wibbly-wobbly in 1.2.0 and 1.2.1, these should be much better now
* Switching account through the app menu or keyboard shortcut now makes sure the app is focused and visible
* Changed spellcheck library because of performance issues
* Fixed icon tray icon quality on osx
* Fixed context menu on linux
* Fix tray icon no longer appearing on linux
* Single app support on linux thanks to @PaulBGD
* Made sure notifications no longer fire when launching the app
* Fixed high cpu usage and false notifications firing
* New mail notification criteria is a bit stricter to prevent outdated notifications
* Fixed fullscreen mode
* No longer show notification if download is cancelled


## Code
* Continued an on-wards march to keep dependencies updated
* Moved forward with React to version 15 which required quite a few code patches
* Updated settings screen for accounts to remove duplicated code
* Reduced API quota usage with google by optimising http calls
* Updated build dependencies
* Updated permission denial to use official API in latest electron rather than hack we used to use for Google

This release feels like it's been the hardest and most difficult one to put together but it's finally here! Time to enjoy some sunshine ☀️☀️☀️. The release originally focused on code improvement and filesize reduction to save my sanity when doing windows builds, but a few great features and bug fixes have snuck in!

# Features
* Added keyboard shortcuts for prev and next mailbox. `ctrl/cmd+<` and `ctrl/cmd+>`
* Added navigate backwards and forwards shortcuts. `ctrl/cmd+[` and `ctrl/cmd+]`
* Added Mailbox Search usable via `ctrl/cmd+F and ctrl/cmd+G'
* Added Primary Inbox support for GMail

# Bugs
* Removed excess top space from side-menu on linux, windows and when the toolbar is enabled
* Focus WMail window when clicking on a notification
* Focus WMail window when clicking on the tray notifications
* Fixed context menu on linux
* Fixed incorrect unread count being shown in some circumstances


# Code
* Code has been restructured into 3 main packages. The primary package, main app and mailboxes window. Because of this I've been able to remove a lot of dead code that was shipping in the production build. This has reduced file size and decreased build time. Here' some fancy stats
  * Production filesize 17% smaller (164mb to 136mb)
  * 95% reduction in files (9878 to 415)
* Dependencies have been updated
* Electron has been updated to version 1.2 which had a few breaking changes
* Startup process looks a fair bit cleaner with UI placeholders
* Moved the database from localstorage to a centralised app database
  * This means data is available throughout the app and database duplication has been removed
  * The main thread has direct access to the data and listens on changes directly
  * The models are now common between the main and rendering thread for reduced code duplication
* The kitchen sink has been taken out of `app.js` to make code more maintable
* Renamed Google Mailbox to WMail on Google Services
* Split the GoogleMailbox view to use a common WebView that deals with the nasties of managing its state
* Changed to use typo.js spellchecker as nodehun has been discontinued. Had to patch the library (submitted PR) and place in an separate thread. This also resulted in the context menu needing to be written in JavaScript rather than using the native menu. Why is finding a good spell checker so hard?!?

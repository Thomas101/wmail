**The mammoth release**. This release contains an amazing 212 commits over version 1.3.1 - almost doubling the total commit count. I think smaller releases are called for in the future!

I'd like to send a giant thanks to everyone who's been testing the pre-release channel and reporting bugs. Without all your testing this release wouldn't have been possible!

### Breaking change
Windows uses upgrading from 1.3.6 earlier will need to uninstall WMail before upgrading. Not doing this will result in two WMail installs. [More information](https://github.com/Thomas101/wmail/wiki/Windows-users-upgrading-to-2.0.0)

# Upgrades
All the core libraries WMail uses have been upgraded. These include..
* Updated to chrome 53
* Updated to electron 1.4.4
* Updated to React 15.3.2

# Keyboard Shortcuts
* Added keyboard shortcuts for prev and next mailbox. `ctrl/cmd+<` and `ctrl/cmd+>`
* Added navigate backwards and forwards shortcuts. `ctrl/cmd+[` and `ctrl/cmd+]`
* Added `cmd+0` accelerator for resetting font size
* Added the `cmd/ctrl+left` shortcut like Chrome

# Context Menu
* Context menu now has Paste and Match Style along with a link to the WMail settings
* Added Copy Link Address to Context Menu

# Tray
* Tray icon designer in the settings screen
* Better tray icon on Windows to improve legibility
* Option to change the background colour of the tray icon
* Auto-theming of tray depending on OS theme
* Fixed tray icon needlessly redrawing updates when there were no updates to draw
* DPI Multiplier for tray icon for users with 4K monitors
* Changed Tray menu to have submenus for each mailbox

# User Interface
* Detecting when you launch WMail in an offline state and showing a splash screen rather than a broken WMail
* Consistent Windows app icon (no more pixelation! Woo!)
* Changed the layout of the settings screen to use the available screen space
* Moved Google icon for users who have sidebar disabled and embedded titlebar
* Removed excess top space from side-menu on linux, windows and when the toolbar is enabled
* Added Restart button when you change a setting that requires an app restart
* Added preview of hovered link address
* Add option to set your own CSS and JavaScript on a per mailbox basis. So if you want everything red... you can have everything red 😀
* Unread count over app icon for Ubuntu users using Unity
* Better update dialog and a more robust backend so I can stage the releases
* Update check always happens daily now. Option to disable this

# Notifications
* Focus WMail window when clicking on a notification
* Focus WMail window when clicking on the tray notifications

# Other Features
* Support for 38+ dictionary languages! Bonjour, Hola, Hallo!
* Added Mailbox Search
* Added Primary Inbox support for GMail
* Added option to remove custom account avatar
* Option to open at startup on OS X & windows
* Fixed incorrect unread count being shown in some circumstances
* Option to persist cookies for accounts using SAML authentication & option to nuke data when cookies have expired
* Added ignore-gpu-blacklist flag under advanced for linux users having rendering issues
* Added --hidden command line switch so you can launch WMail in the background
* Downloads now download to a temporary file before completion

# Bugs
* Fixed sidemenu toggle shortcut on windows & linux
* Fixed window offsetting to left when switching mailbox
* Fixed toolbar disappearing on windows & linux
* Removed Open links in background for platforms that don’t support it
* Disabled multiple-account menu items when there is only one account
* Downloads now add the file extension even if the user omits it

# Bundling
* The packaging script now automatically creates the distribution files for each platform
* Windows now has separate 32 and 64 bit builds
* OSX has a brand new dmg rather than just zipping the folder up
* Windows uses a non proprietary installer
* Tar linux builds rather than zip for better compression
* Deb packages for linux

# Code
* Code has been restructured into 3 main packages. The primary package, main app and mailboxes window. Because of this I've been able to remove a lot of dead code that was shipping in the production build. This has reduced file size and decreased build time. Here' some fancy stats
 * Production filesize 17% smaller (164mb to 136mb)
 * 95% reduction in files (9878 to 415)
* Dependencies have been updated
* Startup process looks a fair bit cleaner with UI placeholders
* Moved the database from localstorage to a centralised app database
 * This means data is available throughout the app and database duplication has been removed
 * The main thread has direct access to the data and listens on changes directly
 * The models are now common between the main and rendering thread for reduced code duplication
* The kitchen sink has been taken out of `app.js` to make code more maintainable
* Renamed Google Mailbox to WMail on Google Services
* Split the GoogleMailbox view to use a common WebView that deals with the nasties of managing its state
* Refactored the webview injection code to be more modular and extensible
* Removed multiple instances of dom thrashing in the webview injection code. This should speed up start times

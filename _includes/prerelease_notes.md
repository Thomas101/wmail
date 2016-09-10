This version forms *(hopefully)* the final release candidate for version 1.4.0

# Breaking changes
- Users running **1.3.7** who changed their spellcheck language will lose this setting when upgrading, so you'll need to configure this again.
- Windows uses upgrading from **1.3.6 earlier** will need to uninstall WMail before upgrading. Not doing this will result in two WMail installs

# Updates
- Replaced the JavaScript spell checker with prebuilt native versions of hunspell (hunspell is what chrome, firefox, openOffice etc uses). This makes everything better and has allowed me to add some extra features. These include:
	- Reduced RAM and CPU usage
	- Makes spellchecking much faster and spelling suggestions much much MUCH faster!
	- Removes the need for WMail to listen on an incoming network port
	- Fixes issues with some dictionaries (including Italian and Russian)
	- Allows WMail to save downloaded dictionaries rather than throwing them away every time the dictionary is changed
	- Allows WMail to use native context menus which means paste works across the app instead of in most places
	- Allows WMail to support multiple dictionaries at once
- Added `ignore-gpu-blacklist` flag under advanced for linux users having rendering issues
- Added Restart button when you change a setting that requires an app restart
- Disabled multiple-account menu items when there is only one account
- Added preview of hovered link address
- Add option to set your own CSS and JavaScript on a per mailbox basis. So if you want everything red... you can have everything red 😀
- Deb packages for linux
- Unread count over app icon for Ubuntu users using Unity
- DPI Multiplier for tray icon for users with 4K monitors
- Added `--hidden` command line switch so you can launch WMail in the background

*All this and it's not even 9am! Lets find breakfast! 🍳🍳🍳*

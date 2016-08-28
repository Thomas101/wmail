This version forms the first release candidate for version 1.4.0 and is packed full of goodies 😍

# Features

- Support for 38 dictionary languages! Bonjour, Hola, Hallo!
- Detecting when you launch WMail in an offline state and showing a splash screen rather than a broken WMail
- Consistent Windows app icon (no more pixelation! Woo!)
- Better tray icon on Windows to improve legibility
- Option to change the background colour of the tray icon
- Tray icon designer in the settings screen
- Changed the layout of the settings screen to use the available screen space
- Context menu now has `Paste and Match Style` along with a link to the WMail settings
- Added the Cmd/Ctrl+Left shortcut like Chrome
- Better update dialog and a more robust backend so I can stage the releases

# Fixes & Code
- Updated electron and some other libs
- Fixed the zoom level being reset when typing/navigating
- Fixed window management keyboard shortcuts on Linux and Windows
- Hopefully a better fix for the window offset and cut off

# Bundling
- The packaging script now automatically creates the distribution files for each platform
- Windows now has separate 32 and 64 bit builds
- OSX has a brand new dmg rather than just zipping the folder up
- Windows uses a non proprietary installer
- Tar linux builds rather than zip for better compression
    - *On a side note to this, I was hoping to make deb and snap builds for linux. If anyone has any expertise in this area it would be great to work together on this - my linux-foo is weak*

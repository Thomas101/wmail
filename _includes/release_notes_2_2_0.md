This release contains over 130 commits from the last release! It has loads of bug fixes and features tested by the community from the prerelease channel. A huge thanks goes out to everyone who`s been reporting bugs and raising pull requests!

# Upgrades

All the core libraries WMail uses have been upgraded. These include...

Updated to electron 1.6.1
Updated to React 15.4.2
Updated to Material-ui 0.17.0

# Features

- Option to nuke account that artificially persists cookies
- Added delete account button to settings
- Added `cmd+click` for account icons
- Added unread count in window titlebar
- Option to disable smooth scrolling
- Added support for Shift+Click emails in Gmail
- Clicking on the Tray icon now toggles the visibility of the app between shown and hidden for platforms that support it
- Added Mailto link handling on windows and osx
- Added Mailto link handling from command line
- Added compose into tray icon
- Added configuration wizards when adding Mailboxes
- Added app setup wizard
- Check unread count updates more reliably by reading changes the DOM
- Better tooltips on side list items and accounts
- Improved welcome screen
- Added desktop file into linux tar builds
- Added the WMail version into the settings
- Added `Cmd+Ctrl+{` and `Cmd+Ctrl+}` global shortcuts to switch accounts in a similar way to chrome (Thanks to @theRealWardo for the pull request)
- Added WMail News


# Bugs

- Fix to installer when upgrading WMail on windows
- Fix launching WMail with hidden flag when it was maximised last
- Fix for windows forgetting window position after being maximised
- Change name of 32bit builds to have ia32 suffix and 64bit builds to have x86_64 suffix
- Fix for opening links in inbox
- Fix for deb installer where desktop-file-install isn’t available
- Fixes to unread count reporting higher number than actually unread
- Fixes to unread count not reporting correctly for users with more than 100 unread messages
- Fix missing libtrayindicator1 dependency for ubuntu 16+
- Fixed WMail fully quitting when clicking the close window button whilst the window is out of focus
- Fixed parsing email subjects that would fail under certain circumstances
- Fixes to the windows installer that was silently quitting for some users
- Reduced the binary file size by stripping out some platform specific code
- Fixed dragging images out of the window making the app clear down
- Disabled dragging images from sidebar
- Changed the default setting of Ignore GPU blacklist to improve compatibility on linux
- Fixed crash on exit (osx)
- Proxy server now automatically uses the same configuration as chrome, so unread counts and notifications should just work without any proxy configuration

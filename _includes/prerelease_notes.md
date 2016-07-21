This release fixes quite a few bugs with 1.3.2 in particular some nasty performance issues and memory leaks. If you're using version 1.3.2 I highly recommend upgrading to this release!

# Features
- Added Cmd+0 accelerator for resetting font size
- Added Copy Link Address to Context Menu

# Bugs 🔧
- Fixed tray icon when dark mode is enabled OS X
- Fixed tray icon needlessly redrawing updates when there were no updates to draw
- Fixed some performance bottlenecks and memory leaks to address bugs introduced in the previous version. (Thanks to everyone who reported those in issues #201 #207)
- Fixed adding custom account icon
- Fixed Context Menu positioning

# Code
- Updated dependencies & electron

This version contains a number of improvements over the previous release; in particular the code that communicates with Google fetching the unread counts and notifications has been overhauled to fix some bugs and quota problems. It would be awesome if anyone testing this release could keep a close eye open for any problems or issues with this and reports them so I can jump on them. If any serious issues crop up this release is backwards compatible with 2.0.1 so don't hesitate to downgrade

### Here's the full list of what's new...

* Better handling of lossy data returned from Google compared to 2.0.2
* Fixes to unread count reporting higher number than actually unread
* Fixes to unread count not reporting correctly for users with more than 100 unread messages
* Fix notifications and unread counts not being retrieved when proxy settings are set
* Atomically write databases protecting against instances where the os force quits
* Added delete account button to settings
* Added cmd+click for account icons
* Added unread count in window titlebar
* Fix missing `libtrayindicator1` dependency for ubuntu 16+
* Option to disable smooth scrolling

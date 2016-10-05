I was hoping to make 1.4.0 the next full release but there's still some outstanding bugs so 1.4.0 is coming out as a prerelease :-/

# Breaking changes

Windows uses upgrading from **1.3.6** earlier will need to uninstall WMail before upgrading. Not doing this will result in two WMail installs

# Changes
Here's what's made it into the release...

- Fixed file upload button styles
- Added Latvian dictionary
- Updated electron & React
- Download notifications now open the file when selecting
- Downloads now download to a temporary file before completion
- Downloads now add the file extension even if the user omits it
- Update check always happens daily now. Option to disable this
- Make WMail respond to `--hidden` command whilst running
- Refactored the webview injection code to be more modular and extensible
- Removed multiple instances of dom thrashing in the webview injection code. This should speed up start times
- Updated some deprecated electron functions
- Changed Tray menu to have submenus for each mailbox
- Tray icon now tries to detect OS theme
- Update cookie persistence code to make it more efficient, thanks to some added electron features

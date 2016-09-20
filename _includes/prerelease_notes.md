This release candidate contains a number of fixes and improvements in preparation for the next major release

# Breaking changes

Windows uses upgrading from **1.3.6** earlier will need to uninstall WMail before upgrading. Not doing this will result in two WMail installs

# Features
- Upgraded to electron 1.4.0 and the latest version of chrome
-Added option to remove custom account avatar
-Moved Google icon for users who have sidebar disabled and embedded titlebar
-Option to open at startup on OS X & windows

# Fixes
- Fix for users not staying logged in when using SAML authentication. A giant thanks goes to @domoritz spending so much time debugging this one with me! 🎉
- Fixed spell checker not working in Google Hangouts
- Added Hungarian, Malay, Lithuanian and Estonian dictionaries
- Fixed cyrillic based dictionaries not working
- Block secondary dictionary languages when charsets are different
- Fixed closing search field not clearing highlighting
- Removed `Open links in background` for platforms that don’t support it

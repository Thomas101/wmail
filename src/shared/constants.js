module.exports = Object.freeze({
  APP_ID: 'tombeverley.wmail',

  MAILBOX_INDEX_KEY: '__index__',

  WEB_URL: 'https://thomas101.github.io/wmail/',
  GITHUB_URL: 'https://github.com/Thomas101/wmail/',
  GITHUB_ISSUE_URL: 'https://github.com/Thomas101/wmail/issues',
  UPDATE_DOWNLOAD_URL: 'http://thomas101.github.io/wmail/download',
  UPDATE_CHECK_URL: 'https://thomas101.github.io/wmail/version.json',
  PRIVACY_URL: 'https://thomas101.github.io/wmail/privacy',
  USER_SCRIPTS_WEB_URL: 'https://github.com/Thomas101/wmail-user-scripts',
  UPDATE_CHECK_INTERVAL: 1000 * 60 * 60 * 24, // 24 hours

  GMAIL_PROFILE_SYNC_MS: 1000 * 60 * 60, // 60 mins
  GMAIL_UNREAD_SYNC_MS: 1000 * 60, // 60 seconds
  GMAIL_NOTIFICATION_MAX_MESSAGE_AGE_MS: 1000 * 60 * 60 * 2, // 2 hours
  GMAIL_NOTIFICATION_FIRST_RUN_GRACE_MS: 1000 * 30, // 30 seconds

  REFOCUS_MAILBOX_INTERVAL_MS: 300,

  DB_EXTENSION: 'wmaildb',
  DB_WRITE_DELAY_MS: 500 // 0.5secs
})

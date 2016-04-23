module.exports = Object.freeze({
  APP_ID: 'tombeverley.wmail',

  GITHUB_URL: 'https://github.com/Thomas101/wmail/',
  GITHUB_ISSUE_URL: 'https://github.com/Thomas101/wmail/issues',
  GITHUB_RELEASES_URL: 'http://thomas101.github.io/wmail/download',
  UPDATE_CHECK_URL: 'https://api.github.com/repos/Thomas101/wmail/releases',

  GMAIL_PROFILE_SYNC_MS: 1000 * 60 * 60, // 60 mins
  GMAIL_UNREAD_SYNC_MS: 1000 * 60, // 60 seconds
  GMAIL_NOTIFICATION_SYNC_MS: 1000 * 60 * 5, // 5 minutes
  GMAIL_NOTIFICATION_MAX_MESSAGE_AGE_MS: 1000 * 60 * 60 * 24, // 1 day
  GMAIL_NOTIFICATION_MESSAGE_CLEANUP_AGE_MS: 1000 * 60 * 60 * 24 * 7, // 7 days
  GMAIL_NOTIFICATION_FIRST_RUN_GRACE_MS: 1000 * 30, // 30 seconds

  REFOCUS_MAILBOX_INTERVAL_MS: 300
})

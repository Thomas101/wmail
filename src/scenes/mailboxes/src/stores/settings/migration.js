const persistence = window.remoteRequire('storage/settingStorage')

module.exports = {
  /**
  * Migrates the data from version 1.3.1
  */
  from_1_3_1: function () {
    if (window.localStorage.getItem('migrate_settings_from_1_3_1') !== 'true') {
      const prev = JSON.parse(window.localStorage.getItem('App_settings') || '{}')
      const next = {
        language: {},
        os: {},
        proxy: prev.proxyServer || {},
        tray: {},
        ui: {}
      }
      const transfer = function (from, bucket, to) {
        if (prev[from] !== undefined) {
          next[bucket][to] = prev[from]
        }
      }

      // Language
      transfer('spellcheckerEnabled', 'language', 'spellcheckerEnabled')

      // os
      transfer('alwaysAskDownloadLocation', 'os', 'alwaysAskDownloadLocation')
      transfer('defaultDownloadLocation', 'os', 'defaultDownloadLocation')
      transfer('notificationsEnabled', 'os', 'notificationsEnabled')
      transfer('notificationsSilent', 'os', 'notificationsSilent')
      transfer('openLinksInBackground', 'os', 'openLinksInBackground')

      // tray
      transfer('showTrayIcon', 'tray', 'show')
      transfer('showTrayUnreadCount', 'tray', 'showUnreadCount')
      transfer('trayReadColor', 'tray', 'readColor')
      transfer('trayUnreadColor', 'tray', 'unreadColor')

      // ui
      transfer('showTitlebar', 'ui', 'showTitlebar')
      transfer('showAppBadge', 'ui', 'showAppBadge')
      transfer('showAppMenu', 'ui', 'showAppMenu')
      transfer('sidebarEnabled', 'ui', 'sidebarEnabled')

      // Save
      persistence.setItem('language', next.language)
      persistence.setItem('os', next.os)
      persistence.setItem('proxy', next.proxy)
      persistence.setItem('tray', next.tray)
      persistence.setItem('ui', next.ui)

      // Save
      window.localStorage.setItem('pre_1_3_1:App_settings', JSON.stringify(prev))
      window.localStorage.removeItem('App_settings')
    }

    window.localStorage.setItem('migrate_settings_from_1_3_1', 'true')
  }
}

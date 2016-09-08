const Model = require('../Model')

const LOGIN_OPEN_MODES = Object.freeze({
  OFF: 0,
  ON: 1,
  ON_BACKGROUND: 2
})

class OSSettings extends Model {

  static get LOGIN_OPEN_MODES () { return LOGIN_OPEN_MODES }

  get alwaysAskDownloadLocation () { return this._value_('alwaysAskDownloadLocation', true) }
  get defaultDownloadLocation () { return this._value_('defaultDownloadLocation', undefined) }
  get notificationsEnabled () { return this._value_('notificationsEnabled', true) }
  get notificationsSilent () { return this._value_('notificationsSilent', false) }
  get openLinksInBackground () { return this._value_('openLinksInBackground', false) }
  get loginOpenMode () { return this._value_('loginOpenMode', LOGIN_OPEN_MODES.OFF) }
}

module.exports = OSSettings

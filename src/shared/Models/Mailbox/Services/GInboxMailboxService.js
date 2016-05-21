const GoogleMailboxService = require('./GoogleMailboxService')

class GInboxMailboxService extends GoogleMailboxService {

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get service () { return GoogleMailboxService.SERVICES.GINBOX }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get service () { return GoogleMailboxService.SERVICES.GINBOX }
  get name () { return 'Google Inbox' }
  get url () { return 'https://inbox.google.com' }
  get brandColor () { return 'rgb(66, 133, 244)' }
}

module.exports = GInboxMailboxService

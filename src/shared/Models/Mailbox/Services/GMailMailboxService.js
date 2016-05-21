const GoogleMailboxService = require('./GoogleMailboxService')

class GMailMailboxService extends GoogleMailboxService {

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get service () { return GoogleMailboxService.SERVICES.GMAIL }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get service () { return GoogleMailboxService.SERVICES.GMAIL }
  get name () { return 'Gmail' }
  get url () { return 'https://mail.google.com?ibxr=0' }
  get brandColor () { return 'rgb(220, 75, 75)' }
}

module.exports = GMailMailboxService

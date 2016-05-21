const Model = require('../Model')

const SERVICES = Object.freeze({
  GMAIL: 'gmail',
  GINBOX: 'ginbox'
})

class MailboxService extends Model {

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get SERVICES () { return SERVICES }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get service () { throw new Error('Not Implemented') }
  get name () { throw new Error('Not Implemented') }
  get url () { throw new Error('Not Implemented') }
  get brandColor () { throw new Error('Not Implemented') }
}

module.exports = MailboxService

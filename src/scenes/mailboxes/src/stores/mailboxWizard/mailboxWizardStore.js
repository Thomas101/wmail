const alt = require('../alt')
const actions = require('./mailboxWizardActions')
const { Mailbox, Google } = require('shared/Models/Mailbox')
const { ipcRenderer } = window.nativeRequire('electron')
const reporter = require('../../reporter')
const mailboxActions = require('../mailbox/mailboxActions')
const googleActions = require('../google/googleActions')

class MailboxWizardStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.addMailboxOpen = false
    this.configurationOpen = false
    this.configureServicesOpen = false
    this.configurationCompleteOpen = false

    this.provisionalId = null
    this.provisionalJS = null

    /* ****************************************/
    // Query
    /* ****************************************/

    /**
    * @return true if any configuration dialogs are open
    */
    this.hasAnyItemsOpen = () => {
      return this.addMailboxOpen || this.configurationOpen || this.configureServicesOpen || this.configurationCompleteOpen
    }

    /**
    * @return the type of the provisional mailbox or undefined
    */
    this.provisonaMailboxType = () => {
      return (this.provisionalJS || {}).type
    }

    /**
    * @return the type of provisional services for the mailbox
    */
    this.provisionalMailboxSupportedServices = () => {
      const type = this.provisonaMailboxType()
      if (type === Mailbox.TYPE_GINBOX || type === Mailbox.TYPE_GMAIL) {
        return Google.SUPPORTED_SERVICES.filter((s) => s !== Mailbox.SERVICES.DEFAULT)
      } else {
        return []
      }
    }

    /**
    * @return the default mailbox services for the mailbox
    */
    this.provisionalDefaultMailboxServices = () => {
      const type = this.provisonaMailboxType()
      if (type === Mailbox.TYPE_GINBOX || type === Mailbox.TYPE_GMAIL) {
        return Google.DEFAULT_SERVICES
      } else {
        return []
      }
    }

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      handleOpenAddMailbox: actions.OPEN_ADD_MAILBOX,
      handleCancelAddMailbox: actions.CANCEL_ADD_MAILBOX,

      handleAuthenticateGinboxMailbox: actions.AUTHENTICATE_GINBOX_MAILBOX,
      handleAuthenticateGmailMailbox: actions.AUTHENTICATE_GMAIL_MAILBOX,

      handleAuthGoogleMailboxSuccess: actions.AUTH_GOOGLE_MAILBOX_SUCCESS,
      handleAuthGoogleMailboxFailure: actions.AUTH_GOOGLE_MAILBOX_FAILURE,

      handleConfigureMailbox: actions.CONFIGURE_MAILBOX,
      handleConfigureServices: actions.CONFIGURE_MAILBOX_SERVICES,
      handleConfigurationComplete: actions.CONFIGURATION_COMPLETE
    })
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * Resets everything to the original values
  */
  completeClear () {
    this.addMailboxOpen = false
    this.configurationOpen = false
    this.configureServicesOpen = false
    this.configurationCompleteOpen = false
    this.provisionalId = null
    this.provisionalJS = null
  }

  /**
  * Creates the mailbox from the provisional js
  */
  createMailbox () {
    const provisionalType = this.provisonaMailboxType()
    mailboxActions.create.defer(this.provisionalId, this.provisionalJS)
    if (provisionalType === Mailbox.TYPE_GMAIL || provisionalType === Mailbox.TYPE_GINBOX) {
      googleActions.syncMailboxProfile.defer(this.provisionalId)
      googleActions.syncMailboxUnreadCount.defer(this.provisionalId)
    }
  }

  /* **************************************************************************/
  // Wizard lifecycle
  /* **************************************************************************/

  handleOpenAddMailbox () {
    this.addMailboxOpen = true
  }

  handleCancelAddMailbox () {
    this.completeClear()
  }

  /* **************************************************************************/
  // Starting Authentication
  /* **************************************************************************/

  handleAuthenticateGinboxMailbox ({ provisionalId }) {
    this.addMailboxOpen = false
    ipcRenderer.send('auth-google', { id: provisionalId, type: Mailbox.TYPE_GINBOX })
  }

  handleAuthenticateGmailMailbox ({ provisionalId }) {
    this.addMailboxOpen = false
    ipcRenderer.send('auth-google', { id: provisionalId, type: Mailbox.TYPE_GMAIL })
  }

  /* **************************************************************************/
  // Authentication Callbacks
  /* **************************************************************************/

  handleAuthGoogleMailboxSuccess ({ provisionalId, type, auth }) {
    this.configurationOpen = true
    this.provisionalId = provisionalId
    this.provisionalJS = {
      type: type,
      googleAuth: auth
    }
  }

  handleAuthGoogleMailboxFailure ({ evt, data }) {
    if (data.errorMessage.toLowerCase().indexOf('user') === 0) {
      // User cancelled
    } else {
      console.error('[AUTH ERR]', data)
      console.error(data.errorString)
      console.error(data.errorStack)
      reporter.reportError('[AUTH ERR]' + data.errorString)
    }
    this.completeClear()
  }

  /* **************************************************************************/
  // Config
  /* **************************************************************************/

  handleConfigureMailbox ({ configuration }) {
    this.provisionalJS = Object.assign(this.provisionalJS, configuration)
    this.configureServicesOpen = true
  }

  handleConfigureServices ({ enabledServices, compact }) {
    this.provisionalJS = Object.assign(this.provisionalJS, {
      services: enabledServices,
      compactServicesUI: compact
    })

    this.createMailbox()
    this.completeClear()
    this.configurationCompleteOpen = true
  }

  handleConfigurationComplete () {
    this.completeClear()
  }
}

module.exports = alt.createStore(MailboxWizardStore, 'MailboxWizardStore')

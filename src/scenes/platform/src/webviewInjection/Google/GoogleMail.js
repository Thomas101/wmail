const injector = require('../injector')
const {ipcRenderer} = require('electron')
const GoogleWindowOpen = require('./GoogleWindowOpen')
const path = require('path')
const fs = require('fs')
const GmailChangeEmitter = require('./GmailChangeEmitter')
const GinboxChangeEmitter = require('./GinboxChangeEmitter')
const GinboxApi = require('./GinboxApi')
const GmailApiExtras = require('./GmailApiExtras')
const elconsole = require('../elconsole')
const GoogleService = require('./GoogleService')

class GoogleMail extends GoogleService {

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()
    this.googleWindowOpen = new GoogleWindowOpen()

    this.sidebarStylesheet = document.createElement('style')
    this.sidebarStylesheet.innerHTML = `
      [href="#inbox"][data-ved]>* {
        max-height:33px !important;
        margin-top: 22px;
        background-position-x: center;
      }
      [jsaction="global.toggle_main_menu"] {
        margin-top: 5px;
      }
      [jsaction="global.toggle_main_menu"] ~ [data-action-data] {
        margin-top: 21px;
      }
    `

    // Inject some styles
    injector.injectStyle(`
      a[href*="/SignOutOptions"] {
        visibility: hidden !important;
      }
    `)

    // Bind our listeners
    ipcRenderer.on('window-icons-in-screen', this.handleWindowIconsInScreenChange.bind(this))
    ipcRenderer.on('open-message', this.handleOpenMesage.bind(this))
    ipcRenderer.on('get-google-unread-count', this.handleFetchUnreadCount.bind(this))

    if (this.isGmail) {
      this.loadGmailAPI()
      ipcRenderer.on('compose-message', this.handleComposeMessageGmail.bind(this))
    }
    if (this.isGinbox) {
      this.loadInboxAPI()
      ipcRenderer.on('compose-message', this.handleComposeMessageGinbox.bind(this))
    }
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get isGmail () { return window.location.host.indexOf('mail.google') !== -1 }
  get isGinbox () { return window.location.host.indexOf('inbox.google') !== -1 }

  /* **************************************************************************/
  // Loaders
  /* **************************************************************************/

  /**
  * Loads the GMail API
  */
  loadGmailAPI () {
    this.gmailApi = undefined

    const jqueryPath = path.join(__dirname, '../../../../app/node_modules/jquery/dist/jquery.min.js')
    const apiPath = path.join(__dirname, '../../../../app/node_modules/gmail-js/src/gmail.js')

    injector.injectJavaScript(fs.readFileSync(jqueryPath, 'utf8'))
    injector.injectJavaScript(fs.readFileSync(apiPath, 'utf8'), () => {
      const unloadedApi = new window.Gmail()
      unloadedApi.observe.on('load', () => {
        this.gmailApi = unloadedApi
        this.googleWindowOpen.gmailApi = unloadedApi
        this.changeEmitter = new GmailChangeEmitter(unloadedApi)
      })
    })
  }

  /**
  * Loads the inbox API
  */
  loadInboxAPI () {
    this.changeEmitter = new GinboxChangeEmitter()
  }

  /* **************************************************************************/
  // Event handlers
  /* **************************************************************************/

  /**
  * Handles the window icons in the screen chaning
  * @param evt: the event that fired
  * @param data: the data sent with the event
  */
  handleWindowIconsInScreenChange (evt, data) {
    if (data.inscreen) {
      if (!this.sidebarStylesheet.parentElement) {
        document.head.appendChild(this.sidebarStylesheet)
      }
    } else {
      if (this.sidebarStylesheet.parentElement) {
        this.sidebarStylesheet.parentElement.removeChild(this.sidebarStylesheet)
      }
    }
  }

  /**
  * Handles a message open call
  * @param evt: the event that fired
  * @param data: the data sent with the event
  */
  handleOpenMesage (evt, data) {
    if (this.isGmail) {
      window.location.hash = 'inbox/' + data.messageId
    }
  }

  /**
  * Handles fetching the unread count out the dom
  * @param evt: the event that fired
  * @param data: the data that was sent with the event
  */
  handleFetchUnreadCount (evt, data) {
    if (this.isGmail) {
      const info = {
        available: this.gmailApi !== undefined,
        count: this.gmailApi ? this.gmailApi.get.unread_inbox_emails() : undefined
      }
      ipcRenderer.sendToHost({ type: data.__respond__, data: info })
    }
    if (this.isGinbox) {
      const info = { available: false, count: undefined }
      if (GinboxApi.isReady()) {
        try {
          if (GinboxApi.isInboxTabVisible() && !GinboxApi.isInboxPinnedToggled()) {
            info.count = GinboxApi.getVisibleUnreadCount()
            info.available = true
          }
        } catch (ex) {
          elconsole.error('Failed to read Google Inbox Unread count from Dom', ex)
        }
      }
      ipcRenderer.sendToHost({ type: data.__respond__, data: info })
    }
  }

  /**
  * Handles opening the compose ui and prefills relevant items
  * @param evt: the event that fired
  * @param data: the data that was sent with the event
  */
  handleComposeMessageGmail (evt, data) {
    GmailApiExtras.composeMessage(this.gmailApi, data)
  }

  /**
  * Handles opening the compose ui and prefills relevant items
  * @param evt: the event that fired
  * @param data: the data that was sent with the event
  */
  handleComposeMessageGinbox (evt, data) {
    GinboxApi.composeMessage(data)
  }
}

module.exports = GoogleMail

'use strict'

const React = require('react')
const flux = {
  mailbox: require('../stores/mailbox'),
  google: require('../stores/google'),
  settings: require('../stores/settings')
}
const {
  ipcRenderer, remote: {app, shell}
} = window.nativeRequire('electron')
const AppContent = require('./AppContent')
const mailboxDispatch = require('./Dispatch/mailboxDispatch')
const TimerMixin = require('react-timer-mixin')
const constants = require('shared/constants')
const UnreadNotifications = require('../daemons/UnreadNotifications')
const shallowCompare = require('react-addons-shallow-compare')
const Tray = require('./Tray')
const appTheme = require('./appTheme')
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default

const injectTapEventPlugin = require('react-tap-event-plugin')
injectTapEventPlugin()

const navigationDispatch = require('./Dispatch/navigationDispatch')
navigationDispatch.bindIPCListeners()

module.exports = React.createClass({
  displayName: 'App',
  mixins: [TimerMixin],

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.forceFocusTO = null

    this.unreadNotifications = new UnreadNotifications()
    this.unreadNotifications.start()

    flux.mailbox.S.listen(this.mailboxesChanged)
    flux.settings.S.listen(this.settingsChanged)
    flux.google.A.startPollingUpdates()
    flux.google.A.syncAllMailboxes()
    flux.google.A.syncAllMailboxUnreadMessages()

    mailboxDispatch.on('blurred', this.mailboxBlurred)

    ipcRenderer.on('download-completed', this.downloadCompleted)
  },

  componentWillUnmount () {
    this.unreadNotifications.stop()

    flux.mailbox.S.unlisten(this.mailboxesChanged)
    flux.settings.S.unlisten(this.settingsChanged)
    flux.google.A.stopPollingUpdates()

    ipcRenderer.removeListener('download-completed', this.downloadCompleted)

    mailboxDispatch.off('blurred', this.mailboxBlurred)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    const settingsStore = flux.settings.S.getState()
    const mailboxStore = flux.mailbox.S.getState()
    return {
      messagesUnreadCount: mailboxStore.totalUnreadCountForAppBadge(),
      unreadMessages: mailboxStore.unreadMessagesForAppBadge(),
      uiSettings: settingsStore.ui,
      traySettings: settingsStore.tray
    }
  },

  mailboxesChanged (store) {
    this.setState({
      messagesUnreadCount: store.totalUnreadCountForAppBadge(),
      unreadMessages: store.unreadMessagesForAppBadge()
    })
    ipcRenderer.send('mailboxes-changed', {
      mailboxes: store.allMailboxes().map((mailbox) => {
        return { id: mailbox.id, name: mailbox.name, email: mailbox.email }
      })
    })
  },

  settingsChanged (store) {
    this.setState({
      uiSettings: store.ui,
      traySettings: store.tray
    })
  },

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  /* **************************************************************************/
  // IPC Events
  /* **************************************************************************/

  /**
  * Shows a notification of a completed download
  * @param evt: the event that fired
  * @param req: the request that came through
  */
  downloadCompleted (evt, req) {
    const notification = new window.Notification('Download Completed', {
      body: req.filename
    })
    notification.onclick = function () {
      shell.showItemInFolder(req.path)
    }
  },

  /* **************************************************************************/
  // Rendering Events
  /* **************************************************************************/

  /**
  * Handles a mailbox bluring by trying to refocus the mailbox
  * @param evt: the event that fired
  */
  mailboxBlurred (evt) {
    // Requeue the event to run on the end of the render cycle
    this.setTimeout(() => {
      const active = document.activeElement
      if (active.tagName === 'WEBVIEW') {
        // Nothing to do, already focused on mailbox
        this.clearInterval(this.forceFocusTO)
      } else if (active.tagName === 'BODY') {
        // Focused on body, just dip focus onto the webview
        this.clearInterval(this.forceFocusTO)
        mailboxDispatch.refocus()
      } else {
        // focused on some element in the ui, poll until we move back to body
        this.forceFocusTO = this.setInterval(() => {
          if (document.activeElement.tagName === 'BODY') {
            this.clearInterval(this.forceFocusTO)
            mailboxDispatch.refocus()
          }
        }, constants.REFOCUS_MAILBOX_INTERVAL_MS)
      }
    }, constants.REFOCUS_MAILBOX_INTERVAL_MS)
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      traySettings,
      uiSettings,
      unreadMessages,
      messagesUnreadCount
    } = this.state

    if (process.platform === 'darwin') {
      const badgeString = uiSettings.showAppBadge && messagesUnreadCount ? messagesUnreadCount.toString() : ''
      app.dock.setBadge(badgeString)
    }

    return (
      <div>
        <MuiThemeProvider muiTheme={appTheme}>
          <AppContent />
        </MuiThemeProvider>
        {!traySettings.show ? undefined : (
          <Tray
            unreadMessages={unreadMessages}
            unreadCount={messagesUnreadCount}
            showUnreadCount={traySettings.showUnreadCount}
            unreadColor={traySettings.unreadColor}
            readColor={traySettings.readColor} />
          )}
      </div>
    )
  }
})

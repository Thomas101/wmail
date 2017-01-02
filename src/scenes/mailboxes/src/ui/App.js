const React = require('react')
const flux = {
  mailbox: require('../stores/mailbox'),
  google: require('../stores/google'),
  settings: require('../stores/settings')
}
const {
  ipcRenderer, remote: {shell}
} = window.nativeRequire('electron')
const {
  mailboxDispatch, navigationDispatch
} = require('../Dispatch')
const AppContent = require('./AppContent')
const TimerMixin = require('react-timer-mixin')
const constants = require('shared/constants')
const UnreadNotifications = require('../Notifications/UnreadNotifications')
const shallowCompare = require('react-addons-shallow-compare')
const Tray = require('./Tray')
const AppBadge = require('./AppBadge')
const appTheme = require('./appTheme')
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default

const injectTapEventPlugin = require('react-tap-event-plugin')
injectTapEventPlugin()

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
      activeMailboxId: mailboxStore.activeMailboxId(),
      messagesUnreadCount: mailboxStore.totalUnreadCountForAppBadge(),
      uiSettings: settingsStore.ui,
      traySettings: settingsStore.tray
    }
  },

  mailboxesChanged (store) {
    this.setState({
      activeMailboxId: store.activeMailboxId(),
      messagesUnreadCount: store.totalUnreadCountForAppBadge()
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
      shell.openItem(req.path) || shell.showItemInFolder(req.path)
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

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const {
      traySettings,
      uiSettings,
      messagesUnreadCount
    } = this.state

    // Update the app title
    if (uiSettings.showTitlebarCount) {
      if (messagesUnreadCount === 0) {
        document.title = 'WMail'
      } else {
        document.title = `WMail (${messagesUnreadCount})`
      }
    } else {
      document.title = 'WMail'
    }

    return (
      <div>
        <MuiThemeProvider muiTheme={appTheme}>
          <AppContent />
        </MuiThemeProvider>
        {!traySettings.show ? undefined : (
          <Tray
            unreadCount={messagesUnreadCount}
            traySettings={traySettings} />
        )}
        {!uiSettings.showAppBadge ? undefined : (
          <AppBadge unreadCount={messagesUnreadCount} />
        )}
      </div>
    )
  }
})

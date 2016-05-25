'use strict'

const React = require('react')
const flux = {
  mailbox: require('../stores/mailbox'),
  google: require('../stores/google'),
  settings: require('../stores/settings')
}
const AppContent = require('./AppContent')
const ipc = window.nativeRequire('electron').ipcRenderer
const {app, shell} = window.nativeRequire('electron').remote
const mailboxDispatch = require('./Dispatch/mailboxDispatch')
const navigationDispatch = require('./Dispatch/navigationDispatch')
const TimerMixin = require('react-timer-mixin')
const constants = require('shared/constants')
const UnreadNotifications = require('../daemons/UnreadNotifications')
const shallowCompare = require('react-addons-shallow-compare')
const Tray = require('./Tray')
const appTheme = require('./appTheme')
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default

const injectTapEventPlugin = require('react-tap-event-plugin')
injectTapEventPlugin()

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

    ipc.on('switch-mailbox', this.ipcChangeActiveMailbox)
    ipc.on('auth-google-complete', this.ipcAuthMailboxSuccess)
    ipc.on('auth-google-error', this.ipcAuthMailboxFailure)
    ipc.on('mailbox-zoom-in', this.ipcZoomIn)
    ipc.on('mailbox-zoom-out', this.ipcZoomOut)
    ipc.on('mailbox-zoom-reset', this.ipcZoomReset)
    ipc.on('toggle-sidebar', this.toggleSidebar)
    ipc.on('toggle-app-menu', this.toggleAppMenu)
    ipc.on('launch-settings', this.launchSettings)
    ipc.on('download-completed', this.downloadCompleted)
  },

  componentWillUnmount () {
    this.unreadNotifications.stop()

    flux.mailbox.S.unlisten(this.mailboxesChanged)
    flux.settings.S.unlisten(this.settingsChanged)
    flux.google.A.stopPollingUpdates()

    ipc.removeListener('switch-mailbox', this.ipcChangeActiveMailbox)
    ipc.removeListener('auth-google-complete', this.ipcAuthMailboxSuccess)
    ipc.removeListener('auth-google-error', this.ipcAuthMailboxFailure)
    ipc.removeListener('mailbox-zoom-in', this.ipcZoomIn)
    ipc.removeListener('mailbox-zoom-out', this.ipcZoomOut)
    ipc.removeListener('mailbox-zoom-reset', this.ipcZoomReset)
    ipc.removeListener('toggle-sidebar', this.toggleSidebar)
    ipc.removeListener('toggle-app-menu', this.toggleAppMenu)
    ipc.removeListener('launch-settings', this.launchSettings)
    ipc.removeListener('download-completed', this.downloadCompleted)

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
    ipc.send('mailboxes-changed', {
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
  * Receives a change mailbox event
  * @param evt: the event that fired
  * @param req: the request that came through
  */
  ipcChangeActiveMailbox (evt, req) {
    flux.mailbox.A.changeActive(req.mailboxId)
  },

  /**
  * Receives a mailbox success event
  * @param evt: the event that fired
  * @param req: the request that came through
  */
  ipcAuthMailboxSuccess (evt, req) {
    flux.google.A.authMailboxSuccess(req)
  },

  /**
  * Receives a mailbox failure event
  * @param evt: the event that fired
  * @param req: the request that came through
  */
  ipcAuthMailboxFailure (evt, req) {
    // Check to see if the user intentially did this
    if (req.errorMessage.toLowerCase().indexOf('user') === 0) {
      return
    }
    window.alert('Failed to add mailbox')
    flux.google.A.authMailboxFailure(req)
  },

  /**
  * Zooms the active mailbox in
  * @param evt: the event that fired
  * @param req: the request that came through
  */
  ipcZoomIn (evt, req) {
    const store = flux.mailbox.S.getState()
    const mailboxId = store.activeMailboxId()
    if (mailboxId) {
      flux.mailbox.A.update(mailboxId, {
        zoomFactor: Math.min(1.5, store.getMailbox(mailboxId).zoomFactor + 0.1)
      })
    }
  },

  /**
  * Zooms the active mailbox out
  * @param evt: the event that fired
  * @param req: the request that came through
  */
  ipcZoomOut (evt, req) {
    const store = flux.mailbox.S.getState()
    const mailboxId = store.activeMailboxId()
    if (mailboxId) {
      flux.mailbox.A.update(mailboxId, {
        zoomFactor: Math.max(0.5, store.getMailbox(mailboxId).zoomFactor - 0.1)
      })
    }
  },

  /**
  * Resets the zoom on the active mailbox
  * @param evt: the event that fired
  * @param req: the request that came through
  */
  ipcZoomReset (evt, req) {
    const mailboxId = flux.mailbox.S.getState().activeMailboxId()
    if (mailboxId) {
      flux.mailbox.A.update(mailboxId, { zoomFactor: 1.0 })
    }
  },

  /**
  * Toggles the sidebar
  * @param evt: the event that fired
  */
  toggleSidebar (evt) {
    flux.settings.A.toggleSidebar()
  },

  /**
  * Toggles the app menu
  * @param evt: the event that fired
  */
  toggleAppMenu (evt) {
    flux.settings.A.toggleAppMenu()
  },

  /**
  * Launches the settings
  * @param evt: the event that fired
  */
  launchSettings (evt) {
    navigationDispatch.openSettings()
  },

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

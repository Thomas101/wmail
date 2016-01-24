'use strict'

const React = require('react')
const flux = {
  mailbox: require('../stores/mailbox'),
  google: require('../stores/google'),
  settings: require('../stores/settings')
}
const AppContent = require('./AppContent')
const path = require('path')
const ipc = window.nativeRequire('electron').ipcRenderer
const remote = window.nativeRequire('remote')
const app = remote.require('app')
const Tray = remote.require('tray')
const Menu = remote.require('menu')
const injectTapEventPlugin = require('react-tap-event-plugin')
let appTray = null

injectTapEventPlugin()

module.exports = React.createClass({
  displayName: 'App',

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount: function () {
    flux.mailbox.S.listen(this.mailboxesChanged)
    flux.settings.S.listen(this.settingsChanged)
    flux.google.A.startPollSync()
    flux.google.A.syncAllProfiles()
    flux.google.A.syncAllUnreadCounts()

    ipc.on('switch-mailbox', this.ipcChangeActiveMailbox)
    ipc.on('auth-google-complete', this.ipcAuthMailboxSuccess)
    ipc.on('auth-google-error', this.ipcAuthMailboxFailure)
    ipc.on('mailbox-zoom-in', this.ipcZoomIn)
    ipc.on('mailbox-zoom-out', this.ipcZoomOut)
    ipc.on('mailbox-zoom-reset', this.ipcZoomReset)
  },

  componentWillUnmount: function () {
    flux.mailbox.S.unlisten(this.mailboxesChanged)
    flux.settings.S.unlisten(this.settingsChanged)
    flux.google.A.stopPollSync()

    ipc.off('switch-mailbox', this.ipcChangeActiveMailbox)
    ipc.off('auth-google-complete', this.ipcAuthMailboxSuccess)
    ipc.off('auth-google-error', this.ipcAuthMailboxFailure)
    ipc.off('mailbox-zoom-in', this.ipcZoomIn)
    ipc.off('mailbox-zoom-out', this.ipcZoomOut)
    ipc.off('mailbox-zoom-reset', this.ipcZoomReset)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState: function () {
    return { mailbox_ids: flux.mailbox.S.getState().ids() }
  },

  mailboxesChanged: function (store) {
    this.setState({ mailbox_ids: store.ids() })
    this.updateAppBadge(store)
    this.pushDataToMainThread(store)
  },

  settingsChanged: function (store) {
    this.updateAppBadge(undefined, store)
    this.pushDataToMainThread()
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    // Nothing to ever update here. We're basically using this element as an event manager
    return false
  },

  /* **************************************************************************/
  // App
  /* **************************************************************************/

  /**
  * Updates the app badge
  * @param mailboxStore=mailbox store: the mailbox store to use
  * @param settingsStore=settings store: the settings store to use
  */
  updateAppBadge: function (mailboxStore = flux.mailbox.S.getState(), settingsStore = flux.settings.S.getState()) {
    const unread = mailboxStore.totalUnreadCount()
    if (process.platform === 'darwin') {
      if (settingsStore.showAppBadge()) {
        app.dock.setBadge(unread ? unread.toString() : '')
      } else {
        app.dock.setBadge('')
      }
    } else {
      const unreadText = unread ? unread + ' unread mail' : 'No unread mail'
      const appIcon = appTray || (appTray = new Tray(path.resolve('icons/app.png')))
      const contextMenu = Menu.buildFromTemplate([
        { label: unreadText }
      ])
      appIcon.setToolTip(unreadText)
      appIcon.setContextMenu(contextMenu)
    }
  },

  /**
  * Pushes updates to the main thread
  * @param store=mailbox store: the mailbox store to use
  */
  pushDataToMainThread: function (store = flux.mailbox.S.getState()) {
    ipc.send('mailboxes-changed', {
      mailboxes: store.all().map(mailbox => {
        return { id: mailbox.id, name: mailbox.name, email: mailbox.email }
      })
    })
  },

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  /**
  * Receives a change mailbox event
  * @param evt: the event that fired
  * @param req: the request that came through
  */
  ipcChangeActiveMailbox: function (evt, req) {
    flux.mailbox.A.changeActive(req.mailboxId)
  },

  /**
  * Receives a mailbox success event
  * @param evt: the event that fired
  * @param req: the request that came through
  */
  ipcAuthMailboxSuccess: function (evt, req) {
    flux.google.A.authMailboxSuccess(req)
  },

  /**
  * Receives a mailbox failure event
  * @param evt: the event that fired
  * @param req: the request that came through
  */
  ipcAuthMailboxFailure: function (evt, req) {
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
  ipcZoomIn: function (evt, req) {
    const store = flux.mailbox.S.getState()
    const mailboxId = store.activeId()
    if (mailboxId) {
      flux.mailbox.A.update(mailboxId, {
        zoomFactor: Math.min(1.5, store.get(mailboxId).zoomFactor + 0.1)
      })
    }
  },

  /**
  * Zooms the active mailbox out
  * @param evt: the event that fired
  * @param req: the request that came through
  */
  ipcZoomOut: function (evt, req) {
    const store = flux.mailbox.S.getState()
    const mailboxId = store.activeId()
    if (mailboxId) {
      flux.mailbox.A.update(mailboxId, {
        zoomFactor: Math.max(0.5, store.get(mailboxId).zoomFactor - 0.1)
      })
    }
  },

  /**
  * Resets the zoom on the active mailbox
  * @param evt: the event that fired
  * @param req: the request that came through
  */
  ipcZoomReset: function (evt, req) {
    const mailboxId = flux.mailbox.S.getState().activeId()
    if (mailboxId) {
      flux.mailbox.A.update(mailboxId, { zoomFactor: 1.0 })
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render: function () {
    return <AppContent />
  }
})

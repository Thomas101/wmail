'use strict'

import './layout.less'
import './appContent.less'

const React = require('react')
const MailboxWindows = require('./Mailbox/MailboxWindows')
const MailboxComposePicker = require('./Mailbox/MailboxComposePicker')
const Sidelist = require('./Sidelist')
const shallowCompare = require('react-addons-shallow-compare')
const SettingsDialog = require('./Settings/SettingsDialog')
const DictionaryInstallHandler = require('./DictionaryInstaller/DictionaryInstallHandler')
const {navigationDispatch} = require('../Dispatch')
const UpdateCheckDialog = require('./UpdateCheckDialog')
const flux = {
  settings: require('../stores/settings')
}

module.exports = React.createClass({
  displayName: 'AppContent',

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    flux.settings.S.listen(this.settingsDidUpdate)
    navigationDispatch.on('opensettings', this.handleOpenSettings)
  },

  componentWillUnmount () {
    flux.settings.S.unlisten(this.settingsDidUpdate)
    navigationDispatch.off('opensettings', this.handleOpenSettings)
  },

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState () {
    const settingsStore = flux.settings.S.getState()
    return {
      sidebar: settingsStore.ui.sidebarEnabled,
      titlebar: settingsStore.ui.showTitlebar,
      settingsDialog: false,
      settingsRoute: null
    }
  },

  settingsDidUpdate (store) {
    this.setState({
      sidebar: store.ui.sidebarEnabled,
      titlebar: store.ui.showTitlebar
    })
  },

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  /* **************************************************************************/
  // Settings Interaction
  /* **************************************************************************/

  /**
  * Opens the settings dialog
  * @param evt: the event that fired if any
  */
  handleOpenSettings (evt) {
    this.setState({
      settingsDialog: true,
      settingsRoute: evt && evt.route ? evt.route : null
    })
  },

  handleCloseSettings () {
    this.setState({ settingsDialog: false, settingsRoute: null })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render () {
    return (
      <div>
        {!this.state.titlebar ? (<div className='titlebar' />) : undefined}
        <div className='master' style={{ display: this.state.sidebar ? 'block' : 'none' }}>
          <Sidelist />
        </div>
        <div className='detail' style={{ left: this.state.sidebar ? 70 : 0 }}>
          <MailboxWindows />
        </div>
        <SettingsDialog
          open={this.state.settingsDialog}
          onRequestClose={this.handleCloseSettings}
          initialRoute={this.state.settingsRoute} />
        <DictionaryInstallHandler />
        <UpdateCheckDialog />
        <MailboxComposePicker />
      </div>
    )
  }
})

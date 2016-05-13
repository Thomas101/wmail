'use strict'

import './appContent.less'

const React = require('react')
const MailboxWindows = require('./Mailbox/MailboxWindows')
const Sidelist = require('./Sidelist')
const shallowCompare = require('react-addons-shallow-compare')
const SettingsDialog = require('./Settings/SettingsDialog')
const navigationDispatch = require('./Dispatch/navigationDispatch')
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
    return {
      sidebar: flux.settings.S.getState().sidebarEnabled(),
      settingsDialog: false
    }
  },

  settingsDidUpdate (store) {
    this.setState({
      sidebar: store.sidebarEnabled()
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
  */
  handleOpenSettings () {
    this.setState({ settingsDialog: true })
  },

  handleCloseSettings () {
    this.setState({ settingsDialog: false })
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
        <div className='master' style={{ display: this.state.sidebar ? 'block' : 'none' }}>
          <Sidelist />
        </div>
        <div className='detail' style={{ left: this.state.sidebar ? 70 : 0 }}>
          <MailboxWindows />
        </div>
        <SettingsDialog open={this.state.settingsDialog} onRequestClose={this.handleCloseSettings} />
      </div>
    )
  }
})

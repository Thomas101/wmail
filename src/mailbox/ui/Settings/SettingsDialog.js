const React = require('react')
const { Dialog, Tabs, Tab, RaisedButton, Divider } = require('material-ui')
const GeneralSettings = require('./GeneralSettings')
const AccountSettings = require('./AccountSettings')
const AdvancedSettings = require('./AdvancedSettings')
const ipc = window.nativeRequire('electron').ipcRenderer
const flux = {
  settings: require('../../stores/settings')
}

/* eslint-disable react/prop-types */

module.exports = React.createClass({
  displayName: 'SettingsDialog',

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount: function () {
    flux.settings.S.listen(this.settingsChanged)
  },

  componentWillUnmount: function () {
    flux.settings.S.unlisten(this.settingsChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState: function () {
    return {
      currentTab: 'general',
      requiresRestart: flux.settings.S.getState().requiresRestart()
    }
  },

  settingsChanged: function (store) {
    this.setState({ requiresRestart: store.requiresRestart() })
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    if (this.state.currentTab !== nextState.currentTab) { return true }
    if (this.state.requiresRestart !== nextState.requiresRestart) { return true }
    if (nextProps.open !== this.props.open) { return true }

    return false
  },

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Changes the tab
  */
  handleTabChange: function (value) {
    if (typeof (value) === 'string') {
      this.setState({ currentTab: value })
    }
  },

  /**
  * Closes the modal
  */
  handleClose: function () {
    this.props.onRequestClose()
  },

  /**
  * Restarts the app
  */
  handleRestart: function () {
    ipc.send('restart-app', {})
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render: function () {
    let buttons
    if (this.state.requiresRestart) {
      buttons = (
        <div style={{ padding: 24, textAlign: 'right' }}>
          <RaisedButton label='Close' secondary onClick={this.handleClose} />
          <span>&nbsp;</span>
          <RaisedButton label='Restart' primary onClick={this.handleRestart} />
        </div>
      )
    } else {
      buttons = (
        <div style={{ padding: 24, textAlign: 'right' }}>
          <RaisedButton label='Close' primary onClick={this.handleClose} />
        </div>
      )
    }

    return (
      <Dialog
        modal={false}
        open={this.props.open}
        bodyStyle={{ padding: 0 }}
        onRequestClose={this.props.onRequestClose}>
        <Tabs
          value={this.state.currentTab}
          onChange={this.handleTabChange}
          contentContainerStyle={{ padding: 24 }}>
          <Tab label='General' value='general'>
            <GeneralSettings />
          </Tab>
          <Tab label='Accounts' value='accounts'>
            <AccountSettings />
          </Tab>
          <Tab label='Advanced' value='advanced'>
            <AdvancedSettings />
          </Tab>
        </Tabs>
        <Divider />
        { buttons }
      </Dialog>
    )
  }
})

const React = require('react')
const {
  Dialog, RaisedButton, FlatButton, Divider,
  Tabs, Tab,
  Styles: { Colors }
} = require('material-ui')
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

  componentDidMount () {
    flux.settings.S.listen(this.settingsChanged)
  },

  componentWillUnmount () {
    flux.settings.S.unlisten(this.settingsChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      currentTab: 'general',
      requiresRestart: flux.settings.S.getState().requiresRestart()
    }
  },

  settingsChanged (store) {
    this.setState({ requiresRestart: store.requiresRestart() })
  },

  shouldComponentUpdate (nextProps, nextState) {
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
  handleTabChange (value) {
    if (typeof (value) === 'string') {
      this.setState({ currentTab: value })
    }
  },

  /**
  * Closes the modal
  */
  handleClose () {
    this.props.onRequestClose()
  },

  /**
  * Restarts the app
  */
  handleRestart () {
    ipc.send('restart-app', {})
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render () {
    let buttons
    if (this.state.requiresRestart) {
      buttons = (
        <div style={{ textAlign: 'right' }}>
          <Divider style={{ marginBottom: 6 }} />
          <RaisedButton label='Close' secondary onClick={this.handleClose} />
          <span>&nbsp;</span>
          <RaisedButton label='Restart' primary onClick={this.handleRestart} />
        </div>
      )
    } else {
      buttons = (
        <div style={{ textAlign: 'right' }}>
          <Divider style={{ marginBottom: 6 }} />
          <RaisedButton label='Close' primary onClick={this.handleClose} />
        </div>
      )
    }

    const tabInfo = [
      { label: 'General', value: 'general' },
      { label: 'Accounts', value: 'accounts' },
      { label: 'Advanced', value: 'advanced' }
    ]
    const heading = (
      <div style={{ display: 'flex', flexDirection: 'row', alignContent: 'stretch' }}>
        {tabInfo.map(({label, value}) => {
          return (
            <FlatButton
              key={value}
              label={label}
              style={{
                height: 50,
                borderRadius: 0,
                flex: 1,
                borderBottomWidth: 2,
                borderBottomStyle: 'solid',
                borderBottomColor: this.state.currentTab === value ? Colors.redA200 : 'transparent'
              }}
              labelStyle={{
                color: this.state.currentTab === value ? Colors.white : Colors.lightBlue100
              }}
              backgroundColor={Colors.lightBlue600}
              hoverColor={Colors.lightBlue600}
              rippleColor={Colors.lightBlue900}
              onClick={() => this.setState({ currentTab: value })}/>
          )
        })}
      </div>
    )

    return (
      <Dialog
        modal={false}
        title={heading}
        actions={buttons}
        open={this.props.open}
        bodyStyle={{ padding: 0 }}
        autoScrollBodyContent
        onRequestClose={this.props.onRequestClose}>
        <Tabs
          inkBarStyle={{ display: 'none' }}
          tabItemContainerStyle={{ display: 'none' }}
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
      </Dialog>
    )
  }
})

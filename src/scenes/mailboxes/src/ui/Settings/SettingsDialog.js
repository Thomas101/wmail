const React = require('react')
const {
  Dialog, RaisedButton, FlatButton,
  Tabs, Tab
} = require('material-ui')
const GeneralSettings = require('./GeneralSettings')
const AccountSettings = require('./AccountSettings')
const AdvancedSettings = require('./AdvancedSettings')
const Colors = require('material-ui/styles/colors')
const styles = require('./settingStyles')
const { ipcRenderer } = window.nativeRequire('electron')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SettingsDialog',
  propTypes: {
    open: React.PropTypes.bool.isRequired,
    onRequestClose: React.PropTypes.func.isRequired,
    initialRoute: React.PropTypes.object
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (this.props.open !== nextProps.open) {
      const updates = { showRestart: false }
      if (nextProps.open) {
        updates.currentTab = (nextProps.initialRoute || {}).tab || 'general'
      }
      this.setState(updates)
    }
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      currentTab: (this.props.initialRoute || {}).tab || 'general',
      showRestart: false
    }
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
  * Shows the option to restart
  */
  handleShowRestart () {
    this.setState({ showRestart: true })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.currentTab !== nextState.currentTab) { return true }
    if (this.state.showRestart !== nextState.showRestart) { return true }
    if (nextProps.open !== this.props.open) { return true }

    return false
  },

  render () {
    const { showRestart, currentTab } = this.state
    const { onRequestClose, initialRoute, open } = this.props

    const buttons = showRestart ? (
      <div style={{ textAlign: 'right' }}>
        <RaisedButton label='Close' style={{ marginRight: 16 }} onClick={onRequestClose} />
        <RaisedButton label='Restart' primary onClick={() => ipcRenderer.send('relaunch-app', { })} />
      </div>
    ) : (
      <div style={{ textAlign: 'right' }}>
        <RaisedButton label='Close' primary onClick={onRequestClose} />
      </div>
    )

    const tabHeadings = [
      ['General', 'general'],
      ['Accounts', 'accounts'],
      ['Advanced', 'advanced']
    ]

    const heading = (
      <div style={styles.tabToggles}>
        {tabHeadings.map(([label, value]) => {
          return (
            <FlatButton
              key={value}
              label={label}
              style={Object.assign({}, styles.tabToggle, {
                borderBottomColor: currentTab === value ? Colors.redA200 : 'transparent'
              })}
              labelStyle={{
                color: currentTab === value ? Colors.white : Colors.lightBlue100
              }}
              backgroundColor={Colors.lightBlue600}
              hoverColor={Colors.lightBlue600}
              rippleColor={Colors.lightBlue900}
              onClick={() => this.setState({ currentTab: value })} />
          )
        })}
      </div>
    )

    return (
      <Dialog
        modal={false}
        contentStyle={styles.dialog}
        title={heading}
        actions={buttons}
        open={open}
        bodyStyle={{ padding: 0 }}
        titleStyle={{ padding: 0 }}
        autoScrollBodyContent
        onRequestClose={onRequestClose}>
        <Tabs
          inkBarStyle={{ display: 'none' }}
          tabItemContainerStyle={{ display: 'none' }}
          value={currentTab}
          onChange={this.handleTabChange}
          contentContainerStyle={{ padding: 24 }}>
          <Tab label='General' value='general'>
            {currentTab !== 'general' ? undefined : (
              <GeneralSettings showRestart={this.handleShowRestart} />
            )}
          </Tab>
          <Tab label='Accounts' value='accounts'>
            {currentTab !== 'accounts' ? undefined : (
              <AccountSettings
                showRestart={this.handleShowRestart}
                initialMailboxId={(initialRoute || {}).mailboxId} />
            )}
          </Tab>
          <Tab label='Advanced' value='advanced'>
            {currentTab !== 'advanced' ? undefined : (
              <AdvancedSettings showRestart={this.handleShowRestart} />
            )}
          </Tab>
        </Tabs>
      </Dialog>
    )
  }
})

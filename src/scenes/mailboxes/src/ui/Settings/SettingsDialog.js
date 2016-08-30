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
    onRequestClose: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (this.props.open !== nextProps.open) {
      this.setState({ showRestart: false })
    }
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      currentTab: 'general',
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
    const buttons = this.state.showRestart ? (
      <div style={{ textAlign: 'right' }}>
        <RaisedButton label='Close' style={{ marginRight: 16 }} onClick={() => this.props.onRequestClose()} />
        <RaisedButton label='Restart' primary onClick={() => ipcRenderer.send('relaunch-app', { })} />
      </div>
    ) : (
      <div style={{ textAlign: 'right' }}>
        <RaisedButton label='Close' primary onClick={() => this.props.onRequestClose()} />
      </div>
    )

    const tabInfo = [
      { label: 'General', value: 'general', component: (<GeneralSettings showRestart={this.handleShowRestart} />) },
      { label: 'Accounts', value: 'accounts', component: (<AccountSettings />) },
      { label: 'Advanced', value: 'advanced', component: (<AdvancedSettings />) }
    ]
    const heading = (
      <div style={styles.tabToggles}>
        {tabInfo.map(({label, value}) => {
          return (
            <FlatButton
              key={value}
              label={label}
              style={Object.assign({}, styles.tabToggle, {
                borderBottomColor: this.state.currentTab === value ? Colors.redA200 : 'transparent'
              })}
              labelStyle={{
                color: this.state.currentTab === value ? Colors.white : Colors.lightBlue100
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
        open={this.props.open}
        bodyStyle={{ padding: 0 }}
        titleStyle={{ padding: 0 }}
        autoScrollBodyContent
        onRequestClose={this.props.onRequestClose}>
        <Tabs
          inkBarStyle={{ display: 'none' }}
          tabItemContainerStyle={{ display: 'none' }}
          value={this.state.currentTab}
          onChange={this.handleTabChange}
          contentContainerStyle={{ padding: 24 }}>
          {tabInfo.map((tab) => {
            return (
              <Tab label={tab.label} value={tab.value} key={tab.value}>
                {tab.component}
              </Tab>
            )
          })}
        </Tabs>
      </Dialog>
    )
  }
})

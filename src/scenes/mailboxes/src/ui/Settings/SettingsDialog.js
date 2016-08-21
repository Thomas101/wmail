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
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      currentTab: 'general'
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

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.currentTab !== nextState.currentTab) { return true }
    if (nextProps.open !== this.props.open) { return true }

    return false
  },

  render () {
    const buttons = (
      <div style={{ textAlign: 'right' }}>
        <RaisedButton label='Close' primary onClick={() => this.props.onRequestClose()} />
      </div>
    )

    const tabInfo = [
      { label: 'General', value: 'general', component: (<GeneralSettings />) },
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

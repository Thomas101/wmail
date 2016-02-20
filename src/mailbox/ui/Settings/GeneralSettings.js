const React = require('react')
const ReactDOM = require('react-dom')
const { Toggle, Paper, RaisedButton } = require('material-ui')
const flux = {
  settings: require('../../stores/settings')
}

/* eslint-disable react/prop-types */

module.exports = React.createClass({
  displayName: 'GeneralSettings',

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount: function () {
    flux.settings.S.listen(this.settingsChanged)
    ReactDOM.findDOMNode(this.refs.defaultDownloadInput).setAttribute('webkitdirectory', 'webkitdirectory')
  },

  componentWillUnmount: function () {
    flux.settings.S.unlisten(this.settingsChanged)
  },

  componentDidUpdate: function () {
    ReactDOM.findDOMNode(this.refs.defaultDownloadInput).setAttribute('webkitdirectory', 'webkitdirectory')
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  /**
  * Generates the state from the settings
  * @param store=settingsStore: the store to use
  */
  generateState: function (store = flux.settings.S.getState()) {
    return {
      showTitlebar: store.showTitlebar(),
      showAppBadge: store.showAppBadge(),
      showTrayIcon: store.showTrayIcon(),
      spellcheckerEnabled: store.spellcheckerEnabled(),
      sidebarEnabled: store.sidebarEnabled(),
      notificationsEnabled: store.notificationsEnabled(),
      notificationsSilent: store.notificationsSilent(),
      alwaysAskDownloadLocation: store.alwaysAskDownloadLocation(),
      defaultDownloadLocation: store.defaultDownloadLocation()
    }
  },

  getInitialState: function () {
    return this.generateState()
  },

  settingsChanged: function (store) {
    this.setState(this.generateState(store))
  },

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  handleToggleTitlebar: function (evt, toggled) {
    flux.settings.A.setShowTitlebar(toggled)
  },

  handleToggleUnreadBadge: function (evt, toggled) {
    flux.settings.A.setShowAppBadge(toggled)
  },

  handleToggleShowTrayIcon: function (evt, toggled) {
    flux.settings.A.setShowTrayIcon(toggled)
  },

  handleToggleSpellchecker: function (evt, toggled) {
    flux.settings.A.setEnableSpellchecker(toggled)
  },

  handleToggleSidebar: function (evt, toggled) {
    flux.settings.A.setEnableSidebar(toggled)
  },

  handleToggleNotificationsEnabled: function (evt, toggled) {
    flux.settings.A.setNotificationsEnabled(toggled)
  },

  handleToggleNotificationsSilent: function (evt, toggled) {
    flux.settings.A.setNotificationsSilent(!toggled)
  },

  handleSetAlwaysAskDownloadLocation: function (evt, toggled) {
    flux.settings.A.setAlwaysAskDownloadLocation(toggled)
  },

  handleDefaultDownloadLocationChanged: function (evt, d) {
    flux.settings.A.setDefaultDownloadLocation(evt.target.files[0].path)
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render: function () {
    return (
      <div {...this.props}>
        <Paper zDepth={1} style={{ padding: 15, marginBottom: 5 }}>
          {
            process.platform !== 'darwin' ? undefined : [
              (<Toggle
                key='0'
                toggled={this.state.showTitlebar}
                label={<span><span>Show titlebar</span> <small>(Changes applied after restart)</small></span>}
                onToggle={this.handleToggleTitlebar} />),
              (<br key='1' />)
            ]
          }
          <Toggle
            toggled={this.state.showAppBadge}
            label='Show app unread badge'
            onToggle={this.handleToggleUnreadBadge} />
          <br />
          <Toggle
            toggled={this.state.showTrayIcon}
            label='Show tray icon'
            onToggle={this.handleToggleShowTrayIcon} />
          <br />
          <Toggle
            toggled={this.state.sidebarEnabled}
            label='Show sidebar'
            onToggle={this.handleToggleSidebar} />
        </Paper>
        <Paper zDepth={1} style={{ padding: 15, marginTop: 5, marginBottom: 5 }}>
          <Toggle
            toggled={this.state.spellcheckerEnabled}
            label={(<span><span>Spell-checker</span> <small>(Experimental, requires restart)</small></span>)}
            onToggle={this.handleToggleSpellchecker} />
        </Paper>
        <Paper zDepth={1} style={{ padding: 15, marginTop: 5, marginBottom: 5 }}>
          <Toggle
            toggled={this.state.notificationsEnabled}
            label='Show new mail notifications'
            onToggle={this.handleToggleNotificationsEnabled} />
          <br />
          <Toggle
            toggled={!this.state.notificationsSilent}
            label='Play notification sound'
            disabled={!this.state.notificationsEnabled}
            onToggle={this.handleToggleNotificationsSilent} />
        </Paper>
        <Paper zDepth={1} style={{ padding: 15, marginTop: 5, marginBottom: 5 }}>
          <Toggle
            toggled={this.state.alwaysAskDownloadLocation}
            label='Always ask download location'
            onToggle={this.handleSetAlwaysAskDownloadLocation} />
          <br />
          <div>
            <RaisedButton
              label='Select location'
              className='file-button'
              disabled={this.state.alwaysAskDownloadLocation}
              style={{ marginRight: 15 }}>
              <input
                type='file'
                ref='defaultDownloadInput'
                disabled={this.state.alwaysAskDownloadLocation}
                onChange={this.handleDefaultDownloadLocationChanged}
                defaultValue={this.state.defaultDownloadLocation} />
            </RaisedButton>
            {this.state.alwaysAskDownloadLocation ? undefined : <small>{this.state.defaultDownloadLocation}</small>}
          </div>
        </Paper>
      </div>
    )
  }
})

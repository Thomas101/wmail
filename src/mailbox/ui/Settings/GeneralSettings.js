const React = require('react')
const { Toggle, Paper } = require('material-ui')
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
  },

  componentWillUnmount: function () {
    flux.settings.S.unlisten(this.settingsChanged)
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
      spellcheckerEnabled: store.spellcheckerEnabled()
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

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render: function () {
    return (
      <div {...this.props}>
        <Paper zDepth={1} style={{ padding: 15 }}>
          {
            process.platform !== 'darwin' ? undefined : [
              (<Toggle
                key="0"
                toggled={this.state.showTitlebar}
                label={<span><span>Show titlebar</span> <small>(Changes applied after restart)</small></span>}
                onToggle={this.handleToggleTitlebar} />),
              (<br key="1" />)
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
            toggled={this.state.spellcheckerEnabled}
            label={(<span><span>Spell-checker</span> <small>(Experimental, requires restart)</small></span>)}
            onToggle={this.handleToggleSpellchecker} />
        </Paper>
      </div>
    )
  }
})

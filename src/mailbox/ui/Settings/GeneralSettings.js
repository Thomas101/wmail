const React = require('react')
const { Toggle } = require('material-ui')
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
      showAppBadge: store.showAppBadge()
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

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render: function () {
    return (
      <div {...this.props}>
        {
          process.platform !== 'darwin' ? undefined : (
            <Toggle
              defaultToggled={this.state.showTitlebar}
              label={<span><span>Show titlebar</span> <small>(Changes applied after restart)</small></span>}
              onToggle={this.handleToggleTitlebar} />
          )
        }
        <Toggle
          defaultToggled={this.state.showAppBadge}
          label='Show app unread badge'
          onToggle={this.handleToggleUnreadBadge} />
      </div>
    )
  }
})

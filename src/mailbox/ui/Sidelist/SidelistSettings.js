const React = require('react')
const { IconButton, Styles } = require('material-ui')
const SettingsDialog = require('../Settings/SettingsDialog')

/* eslint-disable react/prop-types */

module.exports = React.createClass({
  displayName: 'SidelistSettings',

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState: function () {
    return { settings: true }
  },

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Opens the settings dialog
  */
  handleOpenSettings: function () {
    this.setState({ settings: true })
  },

  handleCloseSettings: function () {
    this.setState({ settings: false })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render: function () {
    return (
      <div className='settings-control'>
        <IconButton
          iconClassName='material-icons'
          tooltip='Settings'
          tooltipPosition='top-center'
          onClick={this.handleOpenSettings}
          iconStyle={{ color: Styles.Colors.blueGrey400 }}>
          settings
        </IconButton>
        <SettingsDialog open={this.state.settings} onRequestClose={this.handleCloseSettings} />
      </div>
    )
  }
})

const React = require('react')
const { Toggle, Paper } = require('material-ui')
const { ColorPickerButton } = require('../../../Components')
const settingsActions = require('../../../stores/settings/settingsActions')
const styles = require('../settingStyles')
const shallowCompare = require('react-addons-shallow-compare')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'TraySettingsSection',
  propTypes: {
    tray: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const {tray, ...passProps} = this.props

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Tray</h1>
        <Toggle
          toggled={tray.show}
          label='Show icon'
          labelPosition='right'
          onToggle={(evt, toggled) => settingsActions.setShowTrayIcon(toggled)} />
        <Toggle
          toggled={tray.showUnreadCount}
          label='Show unread count'
          labelPosition='right'
          disabled={!tray.show}
          onToggle={(evt, toggled) => settingsActions.setShowTrayUnreadCount(toggled)} />
        <div style={styles.button}>
          <ColorPickerButton
            label='Colour when read'
            disabled={!tray.show}
            value={tray.readColor}
            onChange={(col) => settingsActions.setTrayReadColor(col.hex)} />
        </div>
        <div style={styles.button}>
          <ColorPickerButton
            label='Color when unread'
            disabled={!tray.show}
            value={tray.unreadColor}
            onChange={(col) => settingsActions.setTrayUnreadColor(col.hex)} />
        </div>
      </Paper>
    )
  }
})

const React = require('react')
const { Toggle, Paper, SelectField, MenuItem } = require('material-ui')
const {
  ColorPickerButton, TrayPreview, TrayRenderer,
  Grid: { Row, Col }
} = require('../../../Components')
const settingsActions = require('../../../stores/settings/settingsActions')
const styles = require('../settingStyles')
const shallowCompare = require('react-addons-shallow-compare')
const Tray = require('../../Tray')

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
        <h1 style={styles.subheading}>{process.platform === 'darwin' ? 'Menu Bar' : 'Tray'}</h1>
        <div>
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
          {Tray.platformSupportsDpiMultiplier() ? (
            <SelectField
              floatingLabelText='DPI Multiplier'
              value={tray.dpiMultiplier}
              onChange={(evt, index, value) => settingsActions.setDpiMultiplier(value)}>
              <MenuItem value={1} primaryText='1x' />
              <MenuItem value={2} primaryText='2x' />
              <MenuItem value={3} primaryText='3x' />
              <MenuItem value={4} primaryText='4x' />
              <MenuItem value={5} primaryText='5x' />
            </SelectField>
          ) : undefined }
        </div>
        <br />
        <div>
          <Row>
            <Col xs={6}>
              <h1 style={styles.subheading}>All Messages Read</h1>
              <div style={styles.button}>
                <ColorPickerButton
                  label='Colour'
                  anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                  targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
                  disabled={!tray.show}
                  value={tray.readColor}
                  onChange={(col) => settingsActions.setTrayReadColor(col.rgbaStr)} />
              </div>
              <div style={styles.button}>
                <ColorPickerButton
                  label='Background Colour'
                  anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                  targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
                  disabled={!tray.show}
                  value={tray.readBackgroundColor}
                  onChange={(col) => settingsActions.setTrayReadBackgroundColor(col.rgbaStr)} />
              </div>
              <TrayPreview size={100} config={{
                pixelRatio: 1,
                unreadCount: 0,
                showUnreadCount: tray.showUnreadCount,
                unreadColor: tray.unreadColor,
                readColor: TrayRenderer.themedReadColor(tray.readColor, tray.isReadColorDefault),
                unreadBackgroundColor: tray.readBackgroundColor,
                readBackgroundColor: tray.readBackgroundColor,
                size: 100
              }} />
            </Col>
            <Col xs={6}>
              <h1 style={styles.subheading}>Unread Messages</h1>
              <div style={styles.button}>
                <ColorPickerButton
                  label='Colour'
                  anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                  targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
                  disabled={!tray.show}
                  value={tray.unreadColor}
                  onChange={(col) => settingsActions.setTrayUnreadColor(col.rgbaStr)} />
              </div>
              <div style={styles.button}>
                <ColorPickerButton
                  label='Background Colour'
                  anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                  targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
                  disabled={!tray.show}
                  value={tray.unreadBackgroundColor}
                  onChange={(col) => settingsActions.setTrayUnreadBackgroundColor(col.rgbaStr)} />
              </div>
              <TrayPreview size={100} config={{
                pixelRatio: 1,
                unreadCount: 1,
                showUnreadCount: tray.showUnreadCount,
                unreadColor: tray.unreadColor,
                readColor: TrayRenderer.themedReadColor(tray.readColor, tray.isReadColorDefault),
                unreadBackgroundColor: tray.unreadBackgroundColor,
                readBackgroundColor: tray.readBackgroundColor,
                size: 100
              }} />
            </Col>
          </Row>
        </div>
      </Paper>
    )
  }
})

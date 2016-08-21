const React = require('react')
const { Toggle, Paper } = require('material-ui')
const {
  ColorPickerButton,
  Grid: { Container, Row, Col }
} = require('../../../Components')
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
        <Container fluid>
          <Row>
            <Col sm={6}>
              <Toggle
                toggled={tray.show}
                label='Show tray icon'
                labelPosition='right'
                onToggle={(evt, toggled) => settingsActions.setShowTrayIcon(toggled)} />
              <Toggle
                toggled={tray.showUnreadCount}
                label='Show unread count in tray'
                labelPosition='right'
                disabled={!tray.show}
                onToggle={(evt, toggled) => settingsActions.setShowTrayUnreadCount(toggled)} />
            </Col>
            <Col sm={6}>
              <div>
                <ColorPickerButton
                  label='Tray read colour'
                  disabled={!tray.show}
                  value={tray.readColor}
                  onChange={(col) => settingsActions.setTrayReadColor(col.hex)} />
              </div>
              <br />
              <div>
                <ColorPickerButton
                  label='Tray unread colour'
                  disabled={!tray.show}
                  value={tray.unreadColor}
                  onChange={(col) => settingsActions.setTrayUnreadColor(col.hex)} />
              </div>
            </Col>
          </Row>
        </Container>
      </Paper>
    )
  }
})

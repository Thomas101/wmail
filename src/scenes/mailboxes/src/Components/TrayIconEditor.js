const React = require('react')
const { FontIcon } = require('material-ui')
const {Row, Col} = require('./Grid')
const ColorPickerButton = require('./ColorPickerButton')
const TrayPreview = require('./TrayPreview')
const settingsActions = require('../stores/settings/settingsActions')
const shallowCompare = require('react-addons-shallow-compare')

const styles = {
  subheading: {
    marginTop: 0,
    marginBottom: 10,
    color: '#CCC',
    fontWeight: '300',
    fontSize: 16
  },
  button: {
    marginTop: 5,
    marginBottom: 5
  }
}

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'TrayIconEditor',
  propTypes: {
    tray: React.PropTypes.object.isRequired,
    trayPreviewStyles: React.PropTypes.object
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const {tray, trayPreviewStyles, ...passProps} = this.props

    return (
      <div {...passProps}>
        <Row>
          <Col xs={6}>
            <h1 style={styles.subheading}>All Messages Read</h1>
            <div style={styles.button}>
              <ColorPickerButton
                label='Border'
                icon={<FontIcon className='material-icons'>border_color</FontIcon>}
                anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
                disabled={!tray.show}
                value={tray.readColor}
                onChange={(col) => settingsActions.setTrayReadColor(col.rgbaStr)} />
            </div>
            <div style={styles.button}>
              <ColorPickerButton
                label='Background'
                icon={<FontIcon className='material-icons'>format_color_fill</FontIcon>}
                anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
                disabled={!tray.show}
                value={tray.readBackgroundColor}
                onChange={(col) => settingsActions.setTrayReadBackgroundColor(col.rgbaStr)} />
            </div>
            <TrayPreview size={100} style={trayPreviewStyles} config={{
              pixelRatio: 1,
              unreadCount: 0,
              showUnreadCount: tray.showUnreadCount,
              unreadColor: tray.unreadColor,
              readColor: tray.readColor,
              unreadBackgroundColor: tray.readBackgroundColor,
              readBackgroundColor: tray.readBackgroundColor,
              size: 100
            }} />
          </Col>
          <Col xs={6}>
            <h1 style={styles.subheading}>Unread Messages</h1>
            <div style={styles.button}>
              <ColorPickerButton
                label='Border'
                icon={<FontIcon className='material-icons'>border_color</FontIcon>}
                anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
                disabled={!tray.show}
                value={tray.unreadColor}
                onChange={(col) => settingsActions.setTrayUnreadColor(col.rgbaStr)} />
            </div>
            <div style={styles.button}>
              <ColorPickerButton
                label='Background'
                icon={<FontIcon className='material-icons'>format_color_fill</FontIcon>}
                anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
                disabled={!tray.show}
                value={tray.unreadBackgroundColor}
                onChange={(col) => settingsActions.setTrayUnreadBackgroundColor(col.rgbaStr)} />
            </div>
            <TrayPreview size={100} style={trayPreviewStyles} config={{
              pixelRatio: 1,
              unreadCount: 1,
              showUnreadCount: tray.showUnreadCount,
              unreadColor: tray.unreadColor,
              readColor: tray.readColor,
              unreadBackgroundColor: tray.unreadBackgroundColor,
              readBackgroundColor: tray.readBackgroundColor,
              size: 100
            }} />
          </Col>
        </Row>
      </div>
    )
  }
})

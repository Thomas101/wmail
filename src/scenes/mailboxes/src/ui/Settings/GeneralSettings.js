const React = require('react')
const ReactDOM = require('react-dom')
const { Toggle, Paper, RaisedButton } = require('material-ui')
const {
  ColorPickerButton,
  Flexbox: { Row, Col }
} = require('../../Components')
const flux = {
  settings: require('../../stores/settings')
}

module.exports = React.createClass({
  displayName: 'GeneralSettings',

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    flux.settings.S.listen(this.settingsChanged)
    ReactDOM.findDOMNode(this.refs.defaultDownloadInput).setAttribute('webkitdirectory', 'webkitdirectory')
  },

  componentWillUnmount () {
    flux.settings.S.unlisten(this.settingsChanged)
  },

  componentDidUpdate () {
    ReactDOM.findDOMNode(this.refs.defaultDownloadInput).setAttribute('webkitdirectory', 'webkitdirectory')
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  /**
  * Generates the state from the settings
  * @param store=settingsStore: the store to use
  */
  generateState (store = flux.settings.S.getState()) {
    return {
      ui: store.ui,
      os: store.os,
      language: store.language,
      tray: store.tray
    }
  },

  getInitialState () {
    return this.generateState()
  },

  settingsChanged (store) {
    this.setState(this.generateState(store))
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render () {
    const {ui, os, language, tray} = this.state

    return (
      <div {...this.props}>
        <Paper zDepth={1} style={{ padding: 15, marginBottom: 5 }}>
          <Row>
            <Col sm={6}>
              {process.platform !== 'darwin' ? undefined : (
                <Toggle
                  labelPosition='right'
                  toggled={ui.showTitlebar}
                  label='Show titlebar (Requires Restart)'
                  onToggle={(evt, toggled) => flux.settings.A.setShowTitlebar(toggled)} />
                )}
              {process.platform === 'darwin' ? undefined : (
                <Toggle
                  labelPosition='right'
                  toggled={ui.showAppMenu}
                  label='Show App Menu'
                  onToggle={(evt, toggled) => flux.settings.A.setShowAppMenu(toggled)} />
              )}
              <Toggle
                toggled={ui.sidebarEnabled}
                label='Show sidebar'
                labelPosition='right'
                onToggle={(evt, toggled) => flux.settings.A.setEnableSidebar(toggled)} />
            </Col>
            <Col sm={6}>
              <Toggle
                toggled={ui.showAppBadge}
                label='Show app unread badge'
                labelPosition='right'
                onToggle={(evt, toggled) => flux.settings.A.setShowAppBadge(toggled)} />
              <Toggle
                toggled={os.openLinksInBackground}
                label='Open links in background'
                labelPosition='right'
                onToggle={(evt, toggled) => flux.settings.A.setOpenLinksInBackground(toggled)} />
            </Col>
          </Row>
        </Paper>
        <Paper zDepth={1} style={{ padding: 15, marginBottom: 5 }}>
          <Row>
            <Col sm={6}>
              <Toggle
                toggled={tray.show}
                label='Show tray icon'
                labelPosition='right'
                onToggle={(evt, toggled) => flux.settings.A.setShowTrayIcon(toggled)} />
              <Toggle
                toggled={tray.showUnreadCount}
                label='Show unread count in tray'
                labelPosition='right'
                disabled={!tray.show}
                onToggle={(evt, toggled) => flux.settings.A.setShowTrayUnreadCount(toggled)} />
            </Col>
            <Col sm={6}>
              <div>
                <ColorPickerButton
                  label='Tray read colour'
                  disabled={!tray.show}
                  value={tray.readColor}
                  onChange={(col) => flux.settings.A.setTrayReadColor(col.hex)} />
              </div>
              <br />
              <div>
                <ColorPickerButton
                  label='Tray unread colour'
                  disabled={!tray.show}
                  value={tray.unreadColor}
                  onChange={(col) => flux.settings.A.setTrayUnreadColor(col.hex)} />
              </div>
            </Col>
          </Row>
        </Paper>
        <Paper zDepth={1} style={{ padding: 15, marginTop: 5, marginBottom: 5 }}>
          <Toggle
            toggled={language.spellcheckerEnabled}
            labelPosition='right'
            label='Spell-checker (requires restart)'
            onToggle={(evt, toggled) => flux.settings.A.setEnableSpellchecker(toggled)} />
        </Paper>
        <Paper zDepth={1} style={{ padding: 15, marginTop: 5, marginBottom: 5 }}>
          <Toggle
            toggled={os.notificationsEnabled}
            labelPosition='right'
            label='Show new mail notifications'
            onToggle={(evt, toggled) => flux.settings.A.setNotificationsEnabled(toggled)} />
          <br />
          <Toggle
            toggled={!os.notificationsSilent}
            label='Play notification sound'
            labelPosition='right'
            disabled={!os.notificationsEnabled}
            onToggle={(evt, toggled) => flux.settings.A.setNotificationsSilent(!toggled)} />
        </Paper>
        <Paper zDepth={1} style={{ padding: 15, marginTop: 5, marginBottom: 5 }}>
          <div>
            <Toggle
              toggled={os.alwaysAskDownloadLocation}
              label='Always ask download location'
              labelPosition='right'
              onToggle={(evt, toggled) => flux.settings.A.setAlwaysAskDownloadLocation(toggled)} />
            <br />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <RaisedButton
              label='Select location'
              className='file-button'
              disabled={os.alwaysAskDownloadLocation}
              style={{ marginRight: 15, overflow: 'hidden', position: 'relative' }}>
              <input
                type='file'
                style={{
                  position: 'absolute',
                  top: -100,
                  left: -100,
                  right: -100,
                  bottom: -100,
                  opacity: 0,
                  zIndex: 100
                }}
                ref='defaultDownloadInput'
                disabled={os.alwaysAskDownloadLocation}
                onChange={(evt) => flux.settings.A.setDefaultDownloadLocation(evt.target.files[0].path)} />
            </RaisedButton>
            {os.alwaysAskDownloadLocation ? undefined : <small>{os.defaultDownloadLocation}</small>}
          </div>
        </Paper>
      </div>
    )
  }
})

const React = require('react')
const ReactDOM = require('react-dom')
const { Toggle, Paper, RaisedButton } = require('material-ui')
const ColorPicker = require('react-color').default
const flux = {
  settings: require('../../stores/settings')
}
const { Row, Col } = require('../Flexbox')

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
      showAppMenu: store.showAppMenu(),
      sidebarEnabled: store.sidebarEnabled(),

      showTrayIcon: store.showTrayIcon(),
      showTrayUnreadCount: store.showTrayUnreadCount(),
      trayReadColor: store.trayReadColor(),
      trayUnreadColor: store.trayUnreadColor(),

      spellcheckerEnabled: store.spellcheckerEnabled(),

      notificationsEnabled: store.notificationsEnabled(),
      notificationsSilent: store.notificationsSilent(),

      alwaysAskDownloadLocation: store.alwaysAskDownloadLocation(),
      defaultDownloadLocation: store.defaultDownloadLocation(),
      openLinksInBackground: store.openLinksInBackground()
    }
  },

  getInitialState: function () {
    return Object.assign(this.generateState(), {
      showTrayReadColorPicker: false,
      showTrayUnreadColorPicker: false
    })
  },

  settingsChanged: function (store) {
    this.setState(this.generateState(store))
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
          <Row>
            <Col sm={6}>
              {process.platform !== 'darwin' ? undefined : (
                <Toggle
                  labelPosition='right'
                  toggled={this.state.showTitlebar}
                  label={<span><span>Show titlebar</span> <small>(Applied after restart)</small></span>}
                  onToggle={(evt, toggled) => flux.settings.A.setShowTitlebar(toggled)} />
                )}
              {process.platform === 'darwin' ? undefined : (
                <Toggle
                  labelPosition='right'
                  toggled={this.state.showAppMenu}
                  label='Show App Menu'
                  onToggle={(evt, toggled) => flux.settings.A.setShowAppMenu(toggled)} />
              )}
              <Toggle
                toggled={this.state.sidebarEnabled}
                label='Show sidebar'
                labelPosition='right'
                onToggle={(evt, toggled) => flux.settings.A.setEnableSidebar(toggled)} />
            </Col>
            <Col sm={6}>
              <Toggle
                toggled={this.state.showAppBadge}
                label='Show app unread badge'
                labelPosition='right'
                onToggle={(evt, toggled) => flux.settings.A.setShowAppBadge(toggled)} />
              <Toggle
                toggled={this.state.openLinksInBackground}
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
                toggled={this.state.showTrayIcon}
                label='Show tray icon'
                labelPosition='right'
                onToggle={(evt, toggled) => flux.settings.A.setShowTrayIcon(toggled)} />
              <Toggle
                toggled={this.state.showTrayUnreadCount}
                label='Show unread count in tray'
                labelPosition='right'
                disabled={!this.state.showTrayIcon}
                onToggle={(evt, toggled) => flux.settings.A.setShowTrayUnreadCount(toggled)} />
            </Col>
            <Col sm={6}>
              <div>
                <RaisedButton
                  label='Tray read colour'
                  disabled={!this.state.showTrayIcon}
                  onClick={() => this.setState({ showTrayReadColorPicker: true })} />
                <ColorPicker
                  display={this.state.showTrayReadColorPicker}
                  type='swatches'
                  positionCSS={{left: 0}}
                  onClose={() => this.setState({ showTrayReadColorPicker: false })}
                  onChangeComplete={(col) => flux.settings.A.setTrayReadColor('#' + col.hex)} />
              </div>
              <br />
              <div>
                <RaisedButton
                  label='Tray unread colour'
                  disabled={!this.state.showTrayIcon}
                  onClick={() => this.setState({ showTrayUnreadColorPicker: true })} />
                <ColorPicker
                  display={this.state.showTrayUnreadColorPicker}
                  type='swatches'
                  positionCSS={{left: 0}}
                  onClose={() => this.setState({ showTrayUnreadColorPicker: false })}
                  onChangeComplete={(col) => flux.settings.A.setTrayUnreadColor('#' + col.hex)} />
              </div>
            </Col>
          </Row>
        </Paper>
        <Paper zDepth={1} style={{ padding: 15, marginTop: 5, marginBottom: 5 }}>
          <Toggle
            toggled={this.state.spellcheckerEnabled}
            labelPosition='right'
            label={(<span><span>Spell-checker</span> <small>(Experimental, requires restart)</small></span>)}
            onToggle={(evt, toggled) => flux.settings.A.setEnableSpellchecker(toggled)} />
        </Paper>
        <Paper zDepth={1} style={{ padding: 15, marginTop: 5, marginBottom: 5 }}>
          <Toggle
            toggled={this.state.notificationsEnabled}
            labelPosition='right'
            label='Show new mail notifications'
            onToggle={(evt, toggled) => flux.settings.A.setNotificationsEnabled(toggled)} />
          <br />
          <Toggle
            toggled={!this.state.notificationsSilent}
            label='Play notification sound'
            labelPosition='right'
            disabled={!this.state.notificationsEnabled}
            onToggle={(evt, toggled) => flux.settings.A.setNotificationsSilent(!toggled)} />
        </Paper>
        <Paper zDepth={1} style={{ padding: 15, marginTop: 5, marginBottom: 5 }}>
          <Row>
            <Col sm={6}>
              <Toggle
                toggled={this.state.alwaysAskDownloadLocation}
                label='Always ask download location'
                labelPosition='right'
                onToggle={(evt, toggled) => flux.settings.A.setAlwaysAskDownloadLocation(toggled)} />
            </Col>
            <Col sm={6}>
              <RaisedButton
                label='Select location'
                className='file-button'
                disabled={this.state.alwaysAskDownloadLocation}
                style={{ marginRight: 15 }}>
                <input
                  type='file'
                  ref='defaultDownloadInput'
                  disabled={this.state.alwaysAskDownloadLocation}
                  onChange={(evt) => flux.settings.A.setDefaultDownloadLocation(evt.target.files[0].path)}
                  defaultValue={this.state.defaultDownloadLocation} />
              </RaisedButton>
              {this.state.alwaysAskDownloadLocation ? undefined : <small>{this.state.defaultDownloadLocation}</small>}
            </Col>
          </Row>
        </Paper>
      </div>
    )
  }
})

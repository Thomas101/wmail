const React = require('react')
const {
  Grid: { Container, Row, Col }
} = require('../../Components')
const settingsStore = require('../../stores/settings/settingsStore')
const platformStore = require('../../stores/platform/platformStore')

const DownloadSettingsSection = require('./General/DownloadSettingsSection')
const LanguageSettingsSection = require('./General/LanguageSettingsSection')
const NotificationSettingsSection = require('./General/NotificationSettingsSection')
const TraySettingsSection = require('./General/TraySettingsSection')
const UISettingsSection = require('./General/UISettingsSection')
const InfoSettingsSection = require('./General/InfoSettingsSection')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'GeneralSettings',
  propTypes: {
    showRestart: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
    platformStore.listen(this.platformChanged)
  },

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
    platformStore.unlisten(this.platformChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  /**
  * Generates the settings state from the settings
  * @param store=settingsStore: the store to use
  */
  generateSettingsState (store = settingsStore.getState()) {
    return {
      ui: store.ui,
      os: store.os,
      language: store.language,
      tray: store.tray
    }
  },

  /**
  * Generates the platform state from the settings
  * @param store=platformStore: the store to use
  */
  generatePlatformState (store = platformStore.getState()) {
    const loginPref = store.loginPrefAssumed()
    return {
      openAtLoginSupported: store.loginPrefSupported(),
      openAtLogin: loginPref.openAtLogin,
      openAsHiddenAtLogin: loginPref.openAsHidden
    }
  },

  getInitialState () {
    return Object.assign({}, this.generateSettingsState(), this.generatePlatformState())
  },

  settingsChanged (store) {
    this.setState(this.generateSettingsState(store))
  },

  platformChanged (store) {
    this.setState(this.generatePlatformState(store))
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render () {
    const {ui, os, language, tray, openAtLoginSupported, openAtLogin, openAsHiddenAtLogin} = this.state
    const {showRestart, ...passProps} = this.props

    return (
      <div {...passProps}>
        <Container fluid>
          <Row>
            <Col md={6}>
              <UISettingsSection
                ui={ui}
                os={os}
                showRestart={showRestart}
                openAtLoginSupported={openAtLoginSupported}
                openAtLogin={openAtLogin}
                openAsHiddenAtLogin={openAsHiddenAtLogin} />
              <NotificationSettingsSection os={os} />
              <DownloadSettingsSection os={os} />
              <LanguageSettingsSection language={language} showRestart={showRestart} />
            </Col>
            <Col md={6}>
              <TraySettingsSection tray={tray} />
              <InfoSettingsSection />
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
})

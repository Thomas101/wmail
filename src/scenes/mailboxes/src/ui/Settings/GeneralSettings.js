const React = require('react')
const {
  Grid: { Container, Row, Col }
} = require('../../Components')
const settingsStore = require('../../stores/settings/settingsStore')

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
  },

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  /**
  * Generates the state from the settings
  * @param store=settingsStore: the store to use
  */
  generateState (store = settingsStore.getState()) {
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
    const {showRestart, ...passProps} = this.props

    return (
      <div {...passProps}>
        <Container fluid>
          <Row>
            <Col md={6}>
              <UISettingsSection ui={ui} os={os} showRestart={showRestart} />
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

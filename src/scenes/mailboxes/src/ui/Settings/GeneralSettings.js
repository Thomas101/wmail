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

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'GeneralSettings',

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

    return (
      <div {...this.props}>
        <Container fluid>
          <Row>
            <Col md={6}>
              <UISettingsSection ui={ui} os={os} />
            </Col>
            <Col md={6}>
              <NotificationSettingsSection os={os} />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <DownloadSettingsSection os={os} />
            </Col>
            <Col md={6}>
              <LanguageSettingsSection language={language} />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <TraySettingsSection tray={tray} />
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
})

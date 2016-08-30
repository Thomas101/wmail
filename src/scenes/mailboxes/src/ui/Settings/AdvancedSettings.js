const React = require('react')
const { Toggle, TextField, Paper } = require('material-ui')
const { Container, Row, Col } = require('../../Components/Grid')
const flux = {
  settings: require('../../stores/settings')
}
const styles = require('./settingStyles')
const shallowCompare = require('react-addons-shallow-compare')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AdvancedSettings',
  propTypes: {
    showRestart: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    flux.settings.S.listen(this.settingsChanged)
  },

  componentWillUnmount () {
    flux.settings.S.unlisten(this.settingsChanged)
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
      proxyEnabled: store.proxy.enabled,
      proxyHost: store.proxy.host || '',
      proxyPort: store.proxy.port || '',
      app: store.app
    }
  },

  getInitialState () {
    return this.generateState()
  },

  settingsChanged (store) {
    this.setState(this.generateState(store))
  },

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Enables / disables the proxy server
  */
  handleProxyToggle (evt, toggled) {
    flux.settings.A[toggled ? 'enableProxyServer' : 'disableProxyServer']()
  },

  handleProxyValueChanged (event) {
    flux.settings.A.enableProxyServer(
      this.refs.proxy_host.getValue(),
      this.refs.proxy_port.getValue()
    )
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { proxyEnabled, proxyPort, proxyHost, app } = this.state
    const { showRestart, ...passProps } = this.props

    return (
      <div {...passProps}>
        <Paper zDepth={1} style={styles.paper}>
          <h1 style={styles.subheading}>Proxy Server</h1>
          <Toggle
            name='proxyEnabled'
            defaultToggled={proxyEnabled}
            label='Enable Proxy Server'
            onToggle={this.handleProxyToggle} />
          <small>You also need to set the proxy settings on your OS to ensure all requests use the server</small>
          <Container fluid>
            <Row>
              <Col xs={6}>
                <TextField
                  ref='proxy_host'
                  hintText='http://192.168.1.1'
                  floatingLabelText='Proxy Server Host'
                  defaultValue={proxyHost}
                  onChange={this.handleProxyValueChanged}
                  disabled={!proxyEnabled} />
              </Col>
              <Col xs={6}>
                <TextField
                  ref='proxy_port'
                  hintText='8080'
                  floatingLabelText='Proxy Server Port'
                  defaultValue={proxyPort}
                  onChange={this.handleProxyValueChanged}
                  disabled={!proxyEnabled} />
              </Col>
            </Row>
          </Container>
        </Paper>
        <Paper zDepth={1} style={styles.paper}>
          <Toggle
            toggled={app.ignoreGPUBlacklist}
            label='Ignore GPU Blacklist (Requires Restart)'
            labelPosition='right'
            onToggle={(evt, toggled) => {
              showRestart()
              flux.settings.A.ignoreGPUBlacklist(toggled)
            }} />
        </Paper>
      </div>
    )
  }
})

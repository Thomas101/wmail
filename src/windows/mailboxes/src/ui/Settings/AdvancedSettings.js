const React = require('react')
const { Toggle, TextField, Paper } = require('material-ui')
const { Row, Col } = require('../../Components/Flexbox')
const flux = {
  settings: require('../../stores/settings')
}

module.exports = React.createClass({
  displayName: 'AdvancedSettings',

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
      proxyPort: store.proxy.port || ''
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

  /**
  * Renders the app
  */
  render () {
    return (
      <div {...this.props}>
        <Paper zDepth={1} style={{ padding: 15 }}>
          <Toggle
            name='proxyEnabled'
            defaultToggled={this.state.proxyEnabled}
            label='Enable Proxy Server'
            onToggle={this.handleProxyToggle} />
          <small>You also need to set the proxy settings on your OS to ensure all requests use the server</small>
          <Row>
            <Col xs={6}>
              <TextField
                ref='proxy_host'
                hintText='http://192.168.1.1'
                floatingLabelText='Proxy Server Host'
                defaultValue={this.state.proxyHost}
                onChange={this.handleProxyValueChanged}
                disabled={!this.state.proxyEnabled} />
            </Col>
            <Col xs={6}>
              <TextField
                ref='proxy_port'
                hintText='8080'
                floatingLabelText='Proxy Server Port'
                defaultValue={this.state.proxyPort}
                onChange={this.handleProxyValueChanged}
                disabled={!this.state.proxyEnabled} />
            </Col>
          </Row>
        </Paper>
      </div>
    )
  }
})

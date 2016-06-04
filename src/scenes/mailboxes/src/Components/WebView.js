const React = require('react')
const ReactDOM = require('react-dom')
const camelCase = require('camelcase')

const WEBVIEW_EVENTS = [
  'load-commit',
  'did-finish-load',
  'did-fail-load',
  'did-frame-finish-load',
  'did-start-loading',
  'did-stop-loading',
  'did-get-response-details',
  'did-get-redirect-request',
  'dom-ready',
  'page-title-set',
  'page-favicon-updated',
  'enter-html-full-screen',
  'leave-html-full-screen',
  'console-message',
  'new-window',
  'close',
  'ipc-message',
  'crashed',
  'gpu-crashed',
  'plugin-crashed',
  'destroyed',
  'focus',
  'blur'
]

const WEBVIEW_PROPS = {
  autosize: React.PropTypes.bool,
  disablewebsecurity: React.PropTypes.bool,
  httpreferrer: React.PropTypes.string,
  nodeintegration: React.PropTypes.bool,
  partition: React.PropTypes.string,
  plugins: React.PropTypes.bool,
  preload: React.PropTypes.string,
  src: React.PropTypes.string
}
const WEBVIEW_ATTRS = Object.keys(WEBVIEW_PROPS)

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/
  displayName: 'BrowserView',
  propTypes: Object.assign({
    className: React.PropTypes.string
  }, WEBVIEW_PROPS, WEBVIEW_EVENTS.reduce((acc, name) => {
    acc[camelCase(name)] = React.PropTypes.func
    return acc
  }, {})),

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    const node = this.getWebviewNode()
    WEBVIEW_EVENTS.forEach((name) => {
      node.addEventListener(name, (evt) => {
        this.dispatchWebViewEvent(name, evt)
      })
    })
  },

  componentWillReceiveProps (nextProps) {
    const changed = WEBVIEW_ATTRS.filter((name) => this.props[name] !== nextProps[name])
    if (changed.length) {
      const node = this.getWebviewNode()
      changed.forEach((name) => {
        node.setAttribute(name, nextProps[name] || '')
      })
    }
  },

  shouldComponentUpdate () {
    return false // we never want to re-render. We will handle this manually
  },

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  /**
  * Dispatches a webview event to the appropriate handler
  * @param name: the name of the event
  * @param evt: the event that fired
  */
  dispatchWebViewEvent (name, evt) {
    if (this.props[camelCase(name)]) {
      this.props[camelCase(name)](evt)
    }
  },

  /* **************************************************************************/
  // Webview calls
  /* **************************************************************************/

  focus () { this.getWebviewNode().focus() },

  blur () { this.getWebviewNode().blur() },

  openDevTools () { this.getWebviewNode().openDevTools() },

  reload () {
    this.getWebviewNode().setAttribute('src', this.props.src)
  },

  send (name, obj) { this.getWebviewNode().send(name, obj) },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * @return the webview node
  */
  getWebviewNode () {
    return ReactDOM.findDOMNode(this).getElementsByTagName('webview')[0]
  },

  render () {
    const attrs = WEBVIEW_ATTRS
      .filter((k) => this.props[k] !== undefined)
      .map((k) => `${k}="${this.props[k]}"`)
      .concat([
        'style="position:absolute; top:0; bottom:0; right:0; left:0;"'
      ])
      .join(' ')

    return (
      <div
        className={this.props.className}
        style={{ position: 'relative' }}
        dangerouslySetInnerHTML={{__html: `<webview ${attrs}></webview>`}} />
    )
  }
})

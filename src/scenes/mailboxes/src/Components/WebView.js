const React = require('react')
const ReactDOM = require('react-dom')
const camelCase = require('camelcase')

const SEND_RESPOND_PREFIX = '__SEND_RESPOND__'
const WEBVIEW_EVENTS = [
  'load-commit',
  'did-finish-load',
  'did-fail-load',
  'did-frame-finish-load',
  'did-start-loading',
  'did-stop-loading',
  'did-get-response-details',
  'did-get-redirect-request',
  'did-navigate',
  'did-navigate-in-page',
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
  'blur',
  'update-target-url'
]
const REACT_WEBVIEW_EVENTS = WEBVIEW_EVENTS.map((name) => camelCase(name))

const WEBVIEW_PROPS = {
  autosize: React.PropTypes.bool,
  blinkfeatures: React.PropTypes.string,
  disableblinkfeatures: React.PropTypes.string,
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
  }, WEBVIEW_PROPS, REACT_WEBVIEW_EVENTS.reduce((acc, name) => {
    acc[name] = React.PropTypes.func
    return acc
  }, {})),
  statics: {
    REACT_WEBVIEW_EVENTS: REACT_WEBVIEW_EVENTS
  },

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.ipcPromises = {}

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
      if (name === 'ipc-message') {
        const didSiphon = this.siphonIPCMessage(evt)
        if (didSiphon) { return }
      }

      this.props[camelCase(name)](evt)
    }
  },

  /**
  * Siphons IPC messages
  * @param evt: the event that occured
  * @return true if the event was handled in the siphon
  */
  siphonIPCMessage (evt) {
    if (evt.channel.type.indexOf(SEND_RESPOND_PREFIX) === 0) {
      if (this.ipcPromises[evt.channel.type]) {
        clearTimeout(this.ipcPromises[evt.channel.type].timeout)
        this.ipcPromises[evt.channel.type].resolve(evt.channel.data)
        delete this.ipcPromises[evt.channel.type]
      }
      return true
    } else if (evt.channel.type === 'elevated-log') {
      console.log.apply(this, ['[ELEVATED LOG]', this.getWebviewNode()].concat(evt.channel.messages))
      return true
    } else if (evt.channel.type === 'elevated-error') {
      console.error.apply(this, ['[ELEVATED ERROR]', this.getWebviewNode()].concat(evt.channel.messages))
      return true
    } else {
      return false
    }
  },

  /* **************************************************************************/
  // Webview calls
  /* **************************************************************************/

  focus () {
    const node = this.getWebviewNode()
    if (document.activeElement !== node) {
      this.getWebviewNode().focus()
    }
  },

  blur () { this.getWebviewNode().blur() },

  openDevTools () { this.getWebviewNode().openDevTools() },

  send (name, obj) { this.getWebviewNode().send(name, obj) },

  findInPage (text, options) { return this.getWebviewNode().findInPage(text, options) },

  stopFindInPage (action) { this.getWebviewNode().stopFindInPage(action) },

  navigateBack () { this.getWebviewNode().goBack() },

  navigateForward () { this.getWebviewNode().goForward() },

  undo () { this.getWebviewNode().undo() },

  redo () { this.getWebviewNode().redo() },

  cut () { this.getWebviewNode().cut() },

  copy () { this.getWebviewNode().copy() },

  paste () { this.getWebviewNode().paste() },

  pasteAndMatchStyle () { this.getWebviewNode().pasteAndMatchStyle() },

  selectAll () { this.getWebviewNode().selectAll() },

  setZoomLevel (level) {
    // this.getWebviewNode().setZoomFactor(level)
    this.send('set-zoom-level', { level: level })
  },

  reload () { this.getWebviewNode().reloadIgnoringCache() },

  /* **************************************************************************/
  // IPC Utils
  /* **************************************************************************/

  /**
  * Calls into the webview to get process memory info
  * @return promise
  */
  getProcessMemoryInfo () {
    return this.sendWithResponse('get-process-memory-info')
  },

  /**
  * Calls into the webview to get some data
  * @param sendName: the name to send to the webview
  * @param obj={}: the object to send into the webview. Note __respond__ is reserved
  * @param timeout=5000: the timeout before rejection
  * @return promise
  */
  sendWithResponse (sendName, obj = {}, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString()
      const respondName = SEND_RESPOND_PREFIX + ':' + sendName + ':' + id
      const rejectTimeout = setTimeout(() => {
        delete this.ipcPromises[respondName]
        reject({ timeout: true })
      }, timeout)
      this.ipcPromises[respondName] = { resolve: resolve, timeout: rejectTimeout }
      this.getWebviewNode().send(sendName, Object.assign({}, obj, { __respond__: respondName }))
    })
  },

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
        style={{ position: 'absolute', top: 0, bottom: 0, right: 0, left: 0 }}
        dangerouslySetInnerHTML={{__html: `<webview ${attrs}></webview>`}} />
    )
  }
})

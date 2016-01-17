import "./mailboxWindow.less"
const React = require('react')
const ReactDOM = require('react-dom')
const flux = {
	mailbox : require('../../stores/mailbox'),
	google : require('../../stores/google')
}
const remote = nativeRequire('remote');
const shell = remote.require('shell')

module.exports = React.createClass({
	displayName:'GoogleMailboxWindow',
	/***************************************************************************/
	// Lifecycle
	/***************************************************************************/

  componentDidMount: function() {
  	flux.mailbox.S.listen(this.mailboxesChanged)
  	ReactDOM.findDOMNode(this).appendChild(this.renderWebviewDOMNode())
  },

  componentWillUnmount: function() {
  	flux.mailbox.S.unlisten(this.mailboxesChanged)
  },

	/***************************************************************************/
	// Data lifecycle
	/***************************************************************************/

	getInitialState: function() {
		const mailboxStore = flux.mailbox.S.getState()
		return {
			mailbox : mailboxStore.get(this.props.mailbox_id),
			isActive : mailboxStore.activeId() === this.props.mailbox_id
		}
  },

  mailboxesChanged: function(store) {
  	this.setState({
  		mailbox : store.get(this.props.mailbox_id),
  		isActive : store.activeId() === this.props.mailbox_id
  	})
  },

  shouldComponentUpdate: function(nextProps, nextState) {
  	if (this.state.isActive !== nextState.isActive) {
  		// To prevent react re-rendering the webview and losing state, handle
  		// active manually
  		const elements = ReactDOM.findDOMNode(this).getElementsByTagName('webview') 
  		if (elements.length) {
  			elements[0].classList[nextState.isActive ? 'add' : 'remove']('active')
  		}
  	}

  	return false // we never update this element
  },

  /***************************************************************************/
	// Events
	/***************************************************************************/

	/**
	* Handles a new window open request
	* @param evt: the event
	* @param webview: the webview element the event came from
	*/
	handleOpenNewWindow: function(evt, webview) {
		const whitelist = [
			'https://inbox.google.com',
			'https://mail.google.com'
		]
		if (whitelist.findIndex(w => event.url.indexOf(w) === 0) === -1) {
			shell.openExternal(event.url)
		} else {
			webview.src = event.url
		}
	},

	/***************************************************************************/
	// Rendering
	/***************************************************************************/

	/**
	* For some reason react strips out the partition keyword, so we have to generate
	* the dom node. Also because it reloads the element when active changes and we need
	* the ref to the node for binding electron events we sink down to normal html
	*/
	renderWebviewDOMNode: function() {
		// Build the dom
		const webview = document.createElement('webview')
  	webview.setAttribute('preload', './native/clickReportInjection')
  	webview.setAttribute('partition', 'persist:' + this.state.mailbox.id)
  	webview.setAttribute('src', this.state.mailbox.url)
  	webview.setAttribute('data-mailbox', this.state.mailbox.id)
  	webview.classList.add('mailbox-window')
  	if (this.state.isActive) {
  		webview.classList.add('active')
  	}

  	// Bind events
		webview.addEventListener('dom-ready', () => {
			webview.insertCSS('.gb_9a { visibility: hidden !important; }')
		})
		webview.addEventListener('ipc-message', (event) => {
			if (event.channel.type === 'page-click') {
				flux.google.A.syncUnreadCounts([this.state.mailbox])
			}
		});
		webview.addEventListener('new-window', (event) => {
			this.handleOpenNewWindow(event, webview)
		})
  	
		return webview
	},

	/**
	* Renders the app
	*/
	render: function() {
		if (!this.state.mailbox) { return false }

		return <div {...this.props}></div>

		return elem
	}
})
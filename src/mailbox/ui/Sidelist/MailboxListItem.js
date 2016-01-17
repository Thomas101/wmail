import "./mailboxListItem.less"
const React = require('react')
const flux = {
	mailbox : require('../../stores/mailbox'),
	google : require('../../stores/google')
}
const remote = nativeRequire('remote');
const Menu = remote.require('menu');

module.exports = React.createClass({
	displayName:'MailboxListItem',
	/***************************************************************************/
	// Lifecycle
	/***************************************************************************/

  componentDidMount: function() {
  	flux.mailbox.S.listen(this.mailboxesChanged)
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
  	if (this.state.mailbox !== nextState.mailbox) { return true }
  	if (this.state.isActive !== nextState.isActive) { return true }

  	return false
  },

  /***************************************************************************/
	// User Interaction
	/***************************************************************************/

	/**
	* Handles the item being clicked on
	* @param evt: the event that fired
	*/
	handleClick: function(evt) {
		evt.preventDefault()
		flux.mailbox.A.changeActive(this.state.mailbox.id)
	},

	/**
	* Handles the item being right clicked on
	* @param evt: the event that fired
	*/
	handleRightClick: function(evt) {
		evt.preventDefault()
		Menu.buildFromTemplate([
			{ 
				label: 'Delete', 
				click: () => { flux.mailbox.A.remove(this.state.mailbox.id) }
			},
			{ type: "separator" },
			{ 
				label: 'Reload', 
				click: () => {
					// This isn't strictly the react way to do things
					const mailbox = document.querySelector('webview[data-mailbox="' + this.props.mailbox_id + '"]')
					mailbox.setAttribute('src', mailbox.getAttribute('src'))
					flux.google.A.syncMailbox(this.state.mailbox)
				}
			},
			{ 
				label: 'Inspect',
				click: () => {
					// This isn't strictly the react way to do things
					document.querySelector('webview[data-mailbox="' + this.props.mailbox_id + '"]').openDevTools()
				}
			}
		]).popup(remote.getCurrentWindow())
	},

	/***************************************************************************/
	// Rendering
	/***************************************************************************/

	/**
	* Renders the app
	*/
	render: function() {
		if (!this.state.mailbox) { return false }

		const containerProps = {
			'className' 	: 'mailbox' + (this.state.isActive ? ' active' : ''),
			'data-type' 	: this.state.mailbox.type,
			'title' 			: [
				this.state.mailbox.email || '',
				(this.state.mailbox.name ? '(' + this.state.mailbox.name + ')' : '')
			].join(' ')
		}
		
		// Generate avatar
		let innerElement
		if (this.state.mailbox.avatar) {
			innerElement = <img className="avatar" src={this.state.mailbox.avatar} />
			containerProps.className += ' avatar'
		} else {
			innerElement = <span className="index">{this.props.index + 1}</span>
			containerProps.className += ' index'
		}


		return (
			<div {...this.props} className="list-item" onClick={this.handleClick} onContextMenu={this.handleRightClick}>
				<div {...containerProps}>
					{innerElement}
				</div>
				{this.state.mailbox.unread ? <span className="unread">{this.state.mailbox.unread}</span> : undefined}
			</div>
		)
	}
})
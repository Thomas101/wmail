import './welcome.less'
const React = require('react')
const flux = {
  google: require('../../stores/google')
}

module.exports = React.createClass({
  displayName: 'Welcome',

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  handleAddInbox: function (evt) {
    evt.preventDefault()
    flux.google.A.authInboxMailbox()
  },

  handleAddGmail: function (evt) {
    evt.preventDefault()
    flux.google.A.authGmailMailbox()
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render: function () {
    return (
      <div className='welcome'>
        <h1>Add your first mailbox</h1>
        <p>
          To get started you need to add a mailbox. You can add your Gmail or Google Inbox account.
          <br />
          <small>To add more mailboxes later on just tap the plus icon in the toolbar on the left</small>
        </p>
        <br />
        <br />
        <button type='button' className='btn' onClick={this.handleAddInbox}>Add Inbox Mailbox</button>
        <button type='button' className='btn' onClick={this.handleAddGmail}>Add Gmail Mailbox</button>
      </div>
    )
  }
})

import './welcome.less'
const React = require('react')
const flux = {
  google: require('../../stores/google')
}
const { mailboxWizardActions } = require('../../stores/mailboxWizard')

module.exports = React.createClass({
  displayName: 'Welcome',

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  handleAddInbox (evt) {
    evt.preventDefault()
    flux.google.A.authInboxMailbox()
  },

  handleAddGmail (evt) {
    evt.preventDefault()
    flux.google.A.authGmailMailbox()
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render () {
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
        <button type='button' className='btn' onClick={() => mailboxWizardActions.openAddMailbox()}>Add your first Mailbox</button>
      </div>
    )
  }
})

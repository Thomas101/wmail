const React = require('react')
const { Dialog, RaisedButton, Avatar } = require('material-ui')
const { mailboxWizardStore, mailboxWizardActions } = require('../../stores/mailboxWizard')
const shallowCompare = require('react-addons-shallow-compare')

const styles = {
  mailboxRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  mailboxCell: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 40,
    marginRight: 40
  },
  mailboxAvatar: {
    cursor: 'pointer'
  }
}

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AddMailboxWizardDialog',

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxWizardStore.listen(this.wizardChanged)
  },

  componentWillUnmount () {
    mailboxWizardStore.unlisten(this.wizardChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    const wizardState = mailboxWizardStore.getState()
    return {
      isOpen: wizardState.addMailboxOpen
    }
  },

  wizardChanged (wizardState) {
    this.setState({
      isOpen: wizardState.addMailboxOpen
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { isOpen } = this.state
    const actions = (
      <RaisedButton label='Cancel' onClick={() => mailboxWizardActions.cancelAddMailbox()} />
    )

    return (
      <Dialog
        modal={false}
        actions={actions}
        open={isOpen}
        autoScrollBodyContent
        onRequestClose={() => mailboxWizardActions.cancelAddMailbox()}>
        <div style={styles.mailboxRow}>
          <div style={styles.mailboxCell}>
            <Avatar
              src='../../images/gmail_icon_512.png'
              size={80}
              style={styles.mailboxAvatar}
              onClick={() => mailboxWizardActions.authenticateGmailMailbox()} />
            <p>Add your Gmail account</p>
            <RaisedButton
              label='Add Gmail'
              primary
              onClick={() => mailboxWizardActions.authenticateGmailMailbox()} />
          </div>
          <div style={styles.mailboxCell}>
            <Avatar
              src='../../images/ginbox_icon_512.png'
              size={80}
              style={styles.mailboxAvatar}
              onClick={() => mailboxWizardActions.authenticateGinboxMailbox()} />
            <p>Add your Google Inbox account</p>
            <RaisedButton
              label='Add Google Inbox'
              primary
              onClick={() => mailboxWizardActions.authenticateGinboxMailbox()} />
          </div>
        </div>
      </Dialog>
    )
  }
})

const React = require('react')
const { FontIcon, Dialog, RaisedButton } = require('material-ui')
const Colors = require('material-ui/styles/colors')
const { mailboxWizardStore, mailboxWizardActions } = require('../../stores/mailboxWizard')

const styles = {
  container: {
    textAlign: 'center'
  },
  tick: {
    color: Colors.green600,
    fontSize: '80px'
  },
  instruction: {
    textAlign: 'center'
  }
}

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'ConfigureCompleteWizardDialog',

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
      isOpen: wizardState.configurationCompleteOpen
    }
  },

  wizardChanged (wizardState) {
    this.setState({ isOpen: wizardState.configurationCompleteOpen })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { isOpen } = this.state
    const actions = (
      <RaisedButton
        label='Finish'
        primary
        onClick={() => mailboxWizardActions.configurationComplete()} />
    )

    return (
      <Dialog
        bodyClassName='ReactComponent-MaterialUI-Dialog-Body-Scrollbars'
        modal
        actions={actions}
        open={isOpen}
        autoScrollBodyContent>
        <div style={styles.container}>
          <FontIcon className='material-icons' style={styles.tick}>check_circle</FontIcon>
          <h3>All Done!</h3>
          <p style={styles.instruction}>
            You can change your mailbox settings at any time in the settings
          </p>
        </div>
      </Dialog>
    )
  }
})

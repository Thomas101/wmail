const React = require('react')
const { FontIcon, Dialog, RaisedButton } = require('material-ui')
const Colors = require('material-ui/styles/colors')
const { mailboxWizardStore, mailboxWizardActions } = require('../../stores/mailboxWizard')
const { appWizardActions } = require('../../stores/appWizard')
const { settingsStore } = require('../../stores/settings')

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
    mailboxWizardStore.listen(this.mailboxWizardChanged)
    settingsStore.listen(this.settingsChanged)
  },

  componentWillUnmount () {
    mailboxWizardStore.unlisten(this.mailboxWizardChanged)
    settingsStore.unlisten(this.settingsChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      isOpen: mailboxWizardStore.getState().configurationCompleteOpen,
      hasSeenAppWizard: settingsStore.getState().app.hasSeenAppWizard
    }
  },

  mailboxWizardChanged (wizardState) {
    this.setState({ isOpen: wizardState.configurationCompleteOpen })
  },

  settingsChanged (settingsState) {
    this.setState({ hasSeenAppWizard: settingsStore.getState().app.hasSeenAppWizard })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { isOpen, hasSeenAppWizard } = this.state
    const actions = (
      <RaisedButton
        label='Finish'
        primary
        onClick={() => {
          mailboxWizardActions.configurationComplete()
          if (!hasSeenAppWizard) {
            setTimeout(() => {
              appWizardActions.startWizard()
            }, 500) // Feels more natural after a delay
          }
        }} />
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

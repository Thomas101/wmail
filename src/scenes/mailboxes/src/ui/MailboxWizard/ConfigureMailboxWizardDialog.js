const React = require('react')
const { Dialog, RaisedButton } = require('material-ui')
const { mailboxWizardStore, mailboxWizardActions } = require('../../stores/mailboxWizard')
const shallowCompare = require('react-addons-shallow-compare')
const { Mailbox } = require('shared/Models/Mailbox')

const ConfigureGinboxMailboxWizard = require('./ConfigureGinboxMailboxWizard')
const ConfigureGmailMailboxWizard = require('./ConfigureGmailMailboxWizard')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'ConfigureMailboxWizardDialog',

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
      isOpen: wizardState.configurationOpen,
      mailboxType: wizardState.provisonaMailboxType()
    }
  },

  wizardChanged (wizardState) {
    this.setState({
      isOpen: wizardState.addMailboxOpen,
      mailboxType: wizardState.provisonaMailboxType()
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  /**
  * @param mailboxType: the type of mailbox
  * @return the configurator class for this mailbox type or undefined
  */
  getConfiguratorClass (mailboxType) {
    switch (mailboxType) {
      case Mailbox.TYPE_GINBOX: return ConfigureGinboxMailboxWizard
      case Mailbox.TYPE_GMAIL: return ConfigureGmailMailboxWizard
      default: return undefined
    }
  },

  /**
  * Renders the mailbox configurator for the given type
  * @param mailboxType: the type of mailbox
  * @return jsx
  */
  renderMailboxConfigurator (mailboxType) {
    const Configurator = this.getConfiguratorClass(mailboxType)
    return Configurator ? (
      <Configurator
        onPickedConfiguration={(cfg) => mailboxWizardActions.configureMailbox(cfg)} />
      ) : undefined
  },

  /**
  * Renders the mailbox configurator title for the given type
  * @param mailboxType: the type of mailbox
  * @return jsx
  */
  renderMailboxConfiguratorTitle (mailboxType) {
    const Configurator = this.getConfiguratorClass(mailboxType)
    return Configurator && Configurator.renderTitle ? Configurator.renderTitle() : undefined
  },

  /**
  * Renders the action buttons based on if there is a configuration or not
  * @return jsx
  */
  renderActions () {
    return (
      <div style={{ textAlign: 'left' }}>
        <RaisedButton
          label='Skip'
          onClick={() => mailboxWizardActions.configureMailbox({})} />
      </div>
    )
  },

  render () {
    const { isOpen, mailboxType } = this.state

    return (
      <Dialog
        bodyClassName='ReactComponent-MaterialUI-Dialog-Body-Scrollbars'
        contentStyle={{ width: '90%', maxWidth: 1200 }}
        modal={false}
        title={this.renderMailboxConfiguratorTitle(mailboxType)}
        actions={this.renderActions()}
        open={isOpen}
        onRequestClose={() => mailboxWizardActions.cancelAddMailbox()}
        autoScrollBodyContent>
        {this.renderMailboxConfigurator(mailboxType)}
      </Dialog>
    )
  }
})

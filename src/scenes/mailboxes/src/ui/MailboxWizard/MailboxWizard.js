const React = require('react')
const { mailboxWizardStore } = require('../../stores/mailboxWizard')
const shallowCompare = require('react-addons-shallow-compare')
const AddMailboxWizardDialog = require('./AddMailboxWizardDialog')
const ConfigureMailboxWizardDialog = require('./ConfigureMailboxWizardDialog')
const ConfigureCompleteWizardDialog = require('./ConfigureCompleteWizardDialog')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'MailboxWizard',

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.renderTO = null
    mailboxWizardStore.listen(this.wizardChanged)
  },

  componentWillUnmount () {
    clearTimeout(this.renderTO)
    mailboxWizardStore.unlisten(this.wizardChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    const itemsOpen = mailboxWizardStore.getState().hasAnyItemsOpen()
    return {
      itemsOpen: itemsOpen,
      render: itemsOpen
    }
  },

  wizardChanged (wizardState) {
    this.setState((prevState) => {
      const itemsOpen = wizardState.hasAnyItemsOpen()
      const update = { itemsOpen: itemsOpen }
      if (prevState.itemsOpen !== itemsOpen) {
        clearTimeout(this.renderTO)
        if (prevState.itemsOpen && !itemsOpen) {
          this.renderTO = setTimeout(() => {
            this.setState({ render: false })
          }, 1000)
        } else if (!prevState.itemsOpen && itemsOpen) {
          update.render = true
        }
      }
      return update
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    if (this.state.render) {
      return (
        <div>
          <AddMailboxWizardDialog />
          <ConfigureMailboxWizardDialog />
          <ConfigureCompleteWizardDialog />
        </div>
      )
    } else {
      return null
    }
  }
})

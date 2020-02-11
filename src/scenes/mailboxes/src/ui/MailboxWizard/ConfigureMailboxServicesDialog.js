const React = require('react')
const {
  Dialog, RaisedButton, Checkbox, Toggle,
  Table, TableBody, TableRow, TableRowColumn
} = require('material-ui')
const { mailboxWizardStore, mailboxWizardActions } = require('../../stores/mailboxWizard')
const { Mailbox } = require('shared/Models/Mailbox')

const styles = {
  introduction: {
    textAlign: 'center',
    padding: 12,
    fontSize: '110%',
    fontWeight: 'bold'
  },
  actionCell: {
    width: 48,
    paddingLeft: 0,
    paddingRight: 0,
    textAlign: 'center'
  },
  titleCell: {
    paddingLeft: 0,
    paddingRight: 0
  },
  avatar: {
    height: 22,
    width: 22,
    top: 2
  }
}

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'ConfigureMailboxServicesDialog',

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxWizardStore.listen(this.mailboxWizardChanged)
  },

  componentWillUnmount () {
    mailboxWizardStore.unlisten(this.mailboxWizardChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState (wizardState = mailboxWizardStore.getState()) {
    return {
      isOpen: wizardState.configureServicesOpen,
      mailboxType: wizardState.provisonaMailboxType(),
      availableServices: wizardState.provisionalMailboxSupportedServices(),
      enabledServices: new Set(wizardState.provisionalDefaultMailboxServices()),
      compactServices: false
    }
  },

  mailboxWizardChanged (wizardState) {
    this.setState((prevState) => {
      if (!prevState.isOpen && wizardState.configureServicesOpen) {
        return this.getInitialState(wizardState)
      } else {
        return { isOpen: wizardState.configureServicesOpen }
      }
    })
  },

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Toggles a service
  * @param service: the service type
  * @param toggled: true if its enabled, false otherwise
  */
  handleToggleService (service, toggled) {
    this.setState((prevState) => {
      const enabledServices = new Set(Array.from(prevState.enabledServices))
      enabledServices[toggled ? 'add' : 'delete'](service)
      return { enabledServices: enabledServices }
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the service name
  * @param mailboxType: the type of mailbox
  * @param service: the service type
  * @return the human name for the service
  */
  getServiceName (mailboxType, service) {
    if (mailboxType === Mailbox.TYPE_GMAIL || mailboxType === Mailbox.TYPE_GINBOX) {
      switch (service) {
        case Mailbox.SERVICES.STORAGE: return 'Google Drive'
        case Mailbox.SERVICES.CONTACTS: return 'Google Contacts'
        case Mailbox.SERVICES.NOTES: return 'Google Keep'
        case Mailbox.SERVICES.CALENDAR: return 'Google Calendar'
        case Mailbox.SERVICES.COMMUNICATION: return 'Google Hangouts'
      }
    }

    return ''
  },

  /**
  * @param mailboxType: the type of mailbox
  * @param service: the service type
  * @return the url of the service icon
  */
  getServiceIconUrl (mailboxType, service) {
    if (mailboxType === Mailbox.TYPE_GMAIL || mailboxType === Mailbox.TYPE_GINBOX) {
      switch (service) {
        case Mailbox.SERVICES.STORAGE: return '../../images/google_services/logo_drive_128px.png'
        case Mailbox.SERVICES.CONTACTS: return '../../images/google_services/logo_contacts_128px.png'
        case Mailbox.SERVICES.NOTES: return '../../images/google_services/logo_keep_128px.png'
        case Mailbox.SERVICES.CALENDAR: return '../../images/google_services/logo_calendar_128px.png'
        case Mailbox.SERVICES.COMMUNICATION: return '../../images/google_services/logo_hangouts_128px.png'
      }
    }

    return ''
  },

  render () {
    const { isOpen, enabledServices, mailboxType, availableServices, compactServices } = this.state
    const actions = (
      <RaisedButton
        label='Next'
        primary
        onClick={() => {
          mailboxWizardActions.configureMailboxServices(Array.from(enabledServices), compactServices)
        }} />
    )

    return (
      <Dialog
        bodyClassName='ReactComponent-MaterialUI-Dialog-Body-Scrollbars'
        modal
        actions={actions}
        open={isOpen}
        autoScrollBodyContent>
        <div style={styles.introduction}>
          WMail also gives you access to the other services you use. Pick which
          services you would like to enable for this account
        </div>

        <Table selectable={false}>
          <TableBody displayRowCheckbox={false}>
            {availableServices.map((service) => {
              return (
                <TableRow key={service}>
                  <TableRowColumn style={styles.actionCell}>
                    <img
                      style={styles.avatar}
                      src={this.getServiceIconUrl(mailboxType, service)} />
                  </TableRowColumn>
                  <TableRowColumn style={styles.titleCell}>
                    {this.getServiceName(mailboxType, service)}
                  </TableRowColumn>
                  <TableRowColumn style={styles.actionCell}>
                    <Checkbox
                      onCheck={(evt, checked) => this.handleToggleService(service, checked)}
                      checked={enabledServices.has(service)} />
                  </TableRowColumn>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <Toggle
          toggled={compactServices}
          label='Show sidebar services in compact mode'
          labelPosition='right'
          onToggle={(evt, toggled) => this.setState({ compactServices: toggled })} />
      </Dialog>
    )
  }
})

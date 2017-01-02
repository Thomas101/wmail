const React = require('react')
const { Paper, Checkbox } = require('material-ui')
const mailboxActions = require('../../../stores/mailbox/mailboxActions')
const styles = require('../settingStyles')
const shallowCompare = require('react-addons-shallow-compare')
const Mailbox = require('shared/Models/Mailbox/Mailbox')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AccountServiceSettings',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  /**
  * Renders the service name
  * @param mailbox
  * @param service: the service type
  * @return the human name for the service
  */
  renderServiceName (mailbox, service) {
    if (mailbox.type === Mailbox.TYPE_GMAIL || mailbox.type === Mailbox.TYPE_GINBOX) {
      switch (service) {
        case Mailbox.SERVICES.STORAGE: return 'Google Drive'
        case Mailbox.SERVICES.CONTACTS: return 'Google Contacts'
        case Mailbox.SERVICES.NOTES: return 'Google Keep'
        case Mailbox.SERVICES.CALENDAR: return 'Google Calendar'
      }
    }

    return ''
  },

  render () {
    const { mailbox, ...passProps } = this.props

    const enabledServies = new Set(mailbox.enabledServies)

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Services</h1>
        {Object.keys(mailbox.supportedServices).map((k) => mailbox.supportedServices[k]).map((service) => {
          if (service === Mailbox.SERVICES.DEFAULT) { return undefined }
          return (
            <Checkbox
              key={service}
              label={this.renderServiceName(mailbox, service)}
              checked={enabledServies.has(service)}
              onCheck={(evt, checked) => mailboxActions.toggleService(mailbox.id, service, checked)} />)
        })}
      </Paper>
    )
  }
})

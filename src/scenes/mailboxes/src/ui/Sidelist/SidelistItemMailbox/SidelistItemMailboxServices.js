const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const { Mailbox } = require('shared/Models/Mailbox')
const styles = require('../SidelistStyles')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SidelistItemMailboxServices',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired,
    isActiveMailbox: React.PropTypes.bool.isRequired,
    activeService: React.PropTypes.string.isRequired,
    onOpenService: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
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
      }
    }

    return ''
  },

  /**
  * Renders a single service
  * @param mailbox: the mailbox we are rendering for
  * @param service: the service type
  * @param isActive: true if this service is active
  * @param onOpenService: execute on click
  * @return jsx
  */
  renderService (mailbox, service, isActive, onOpenService) {
    return (
      <div
        key={service}
        style={styles.mailboxServiceIcon}
        onClick={(evt) => onOpenService(evt, service)}>
        <img
          src={this.getServiceIconUrl(mailbox.type, service)}
          style={isActive ? styles.mailboxServiceIconImageActive : styles.mailboxServiceIconImage} />
      </div>
    )
  },

  render () {
    const { mailbox, isActiveMailbox, activeService, onOpenService } = this.props
    if (!mailbox.hasEnabledServices) { return null }

    return (
      <div style={styles.mailboxServiceIcons}>
        {mailbox.enabledServies.map((service) => {
          const isActive = isActiveMailbox && activeService === service
          return this.renderService(mailbox, service, isActive, onOpenService)
        })}
      </div>
    )
  }
})

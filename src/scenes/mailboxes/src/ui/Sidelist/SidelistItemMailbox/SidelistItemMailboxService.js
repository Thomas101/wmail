const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const { Mailbox } = require('shared/Models/Mailbox')
const { Avatar } = require('material-ui')
const styles = require('../SidelistStyles')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SidelistItemMailboxServices',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired,
    isActiveMailbox: React.PropTypes.bool.isRequired,
    isActiveService: React.PropTypes.bool.isRequired,
    onOpenService: React.PropTypes.func.isRequired,
    service: React.PropTypes.string.isRequired
  },

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState () {
    return { isHovering: false }
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

  render () {
    const { mailbox, isActiveMailbox, isActiveService, service, onOpenService } = this.props
    const { isHovering } = this.state
    const isActive = isActiveMailbox && isActiveService

    if (mailbox.compactServicesUI) {
      return (
        <div
          key={service}
          onMouseEnter={() => this.setState({ isHovering: true })}
          onMouseLeave={() => this.setState({ isHovering: false })}
          style={styles.mailboxServiceIconCompact}
          onClick={(evt) => onOpenService(evt, service)}>
          <img
            src={this.getServiceIconUrl(mailbox.type, service)}
            style={isActive || isHovering ? styles.mailboxServiceIconImageActiveCompact : styles.mailboxServiceIconImageCompact} />
        </div>
      )
    } else {
      const borderColor = isActive || isHovering ? mailbox.color : 'white'
      const baseStyle = isActive || isHovering ? styles.mailboxServiceIconImageFullActive : styles.mailboxServiceIconImageFull
      return (
        <Avatar
          src={this.getServiceIconUrl(mailbox.type, service)}
          onMouseEnter={() => this.setState({ isHovering: true })}
          onMouseLeave={() => this.setState({ isHovering: false })}
          size={35}
          backgroundColor='white'
          draggable={false}
          onClick={(evt) => onOpenService(evt, service)}
          style={Object.assign({ borderColor: borderColor }, baseStyle)} />
      )
    }
  }
})

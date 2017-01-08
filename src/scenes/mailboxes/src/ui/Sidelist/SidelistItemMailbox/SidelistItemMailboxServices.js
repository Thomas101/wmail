const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const styles = require('../SidelistStyles')
const SidelistItemMailboxService = require('./SidelistItemMailboxService')

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

  render () {
    const { mailbox, isActiveMailbox, activeService, onOpenService, onContextMenu } = this.props
    if (!mailbox.hasEnabledServices) { return null }

    return (
      <div style={mailbox.compactServicesUI ? styles.mailboxServiceIconsCompact : styles.mailboxServiceIconsFull}>
        {mailbox.enabledServies.map((service) => {
          return (
            <SidelistItemMailboxService
              key={service}
              onContextMenu={onContextMenu}
              mailbox={mailbox}
              isActiveMailbox={isActiveMailbox}
              isActiveService={activeService === service}
              onOpenService={onOpenService}
              service={service} />
          )
        })}
      </div>
    )
  }
})

const React = require('react')
const {Paper, Toggle} = require('material-ui')
const mailboxActions = require('../../../stores/mailbox/mailboxActions')
const styles = require('../settingStyles')
const shallowCompare = require('react-addons-shallow-compare')

module.exports = React.createClass({
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  displayName: 'AccountUnreadSettings',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { mailbox, ...passProps } = this.props
    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Unread &amp; Notifications</h1>
        <Toggle
          defaultToggled={mailbox.showUnreadBadge}
          label='Show unread badge'
          labelPosition='right'
          onToggle={(evt, toggled) => mailboxActions.setShowUnreadBage(mailbox.id, toggled)} />
        <Toggle
          defaultToggled={mailbox.unreadCountsTowardsAppUnread}
          label='Add unread messages to app unread count'
          labelPosition='right'
          onToggle={(evt, toggled) => mailboxActions.setUnreadCountsTowardsAppUnread(mailbox.id, toggled)} />
        <Toggle
          defaultToggled={mailbox.showNotifications}
          label='Show notifications'
          labelPosition='right'
          onToggle={(evt, toggled) => mailboxActions.setShowNotifications(mailbox.id, toggled)} />
      </Paper>
    )
  }
})

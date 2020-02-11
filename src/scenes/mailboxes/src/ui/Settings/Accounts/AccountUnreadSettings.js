const React = require('react')
const {Paper, Toggle, SelectField, MenuItem} = require('material-ui')
const Mailbox = require('shared/Models/Mailbox/Mailbox')
const Google = require('shared/Models/Mailbox/Google')
const mailboxActions = require('../../../stores/mailbox/mailboxActions')
const styles = require('../settingStyles')
const shallowCompare = require('react-addons-shallow-compare')
const Colors = require('material-ui/styles/colors')

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
        {mailbox.type === Mailbox.TYPE_GINBOX ? (
          <SelectField
            fullWidth
            value={mailbox.google.unreadMode}
            onChange={(evt, index, unreadMode) => {
              mailboxActions.updateGoogleConfig(mailbox.id, { unreadMode: unreadMode })
            }}
            floatingLabelText='Unread Mode'>
            <MenuItem
              key={Google.UNREAD_MODES.GINBOX_DEFAULT}
              value={Google.UNREAD_MODES.GINBOX_DEFAULT}
              primaryText='All Unread Unbundled Messages' />
            <MenuItem
              key={Google.UNREAD_MODES.INBOX_UNREAD}
              value={Google.UNREAD_MODES.INBOX_UNREAD}
              primaryText='All Unread Messages' />
            <MenuItem
              key={Google.UNREAD_MODES.INBOX}
              value={Google.UNREAD_MODES.INBOX}
              primaryText='All Messages in inbox' />
          </SelectField>
        ) : undefined}
        {mailbox.type === Mailbox.TYPE_GMAIL ? (
          <SelectField
            fullWidth
            value={mailbox.google.unreadMode}
            onChange={(evt, index, unreadMode) => {
              mailboxActions.updateGoogleConfig(mailbox.id, { unreadMode: unreadMode })
            }}
            floatingLabelText='Unread Mode'>
            <MenuItem
              key={Google.UNREAD_MODES.INBOX_UNREAD}
              value={Google.UNREAD_MODES.INBOX_UNREAD}
              primaryText='All Unread Messages' />
            <MenuItem
              key={Google.UNREAD_MODES.PRIMARY_INBOX_UNREAD}
              value={Google.UNREAD_MODES.PRIMARY_INBOX_UNREAD}
              primaryText='Unread Messages in Primary Category' />
            <MenuItem
              key={Google.UNREAD_MODES.INBOX_UNREAD_IMPORTANT}
              value={Google.UNREAD_MODES.INBOX_UNREAD_IMPORTANT}
              primaryText='Unread Important Messages' />
            <MenuItem
              key={Google.UNREAD_MODES.INBOX}
              value={Google.UNREAD_MODES.INBOX}
              primaryText='All Messages in inbox' />
          </SelectField>
        ) : undefined}
        {mailbox.type === Mailbox.TYPE_GMAIL ? (
          <div>
            <Toggle
              defaultToggled={mailbox.google.takeLabelCountFromUI}
              label='Scrape unread count directly from UI'
              labelPosition='right'
              disabled={!mailbox.google.canChangeTakeLabelCountFromUI}
              onToggle={(evt, toggled) => {
                mailboxActions.updateGoogleConfig(mailbox.id, { takeLabelCountFromUI: toggled })
              }} />
            <div style={{color: Colors.grey500}}>
              <small>This will take the unread count directly from the Gmail user interface. This can improve unread count accuracy</small>
            </div>
          </div>
        ) : undefined}
      </Paper>
    )
  }
})

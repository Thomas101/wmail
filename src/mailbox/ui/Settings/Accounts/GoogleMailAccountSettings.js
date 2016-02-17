const React = require('react')
const { SelectField, MenuItem, Toggle, Paper } = require('material-ui')
const flux = {
  mailbox: require('../../../stores/mailbox')
}

/* eslint-disable react/prop-types */

module.exports = React.createClass({
  displayName: 'GoogleMailAccountSettings',

  propTypes: {
    mailbox: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  handleShowUnreadBadgeChange: function (evt, toggled) {
    flux.mailbox.A.update(this.props.mailbox.id, {
      showUnreadBadge: toggled
    })
  },

  handleShowNotificationsChange: function (evt, toggled) {
    flux.mailbox.A.update(this.props.mailbox.id, {
      showNotifications: toggled
    })
  },

  handleUnreadModeChange: function (evt, index, unreadMode) {
    flux.mailbox.A.updateGoogleConfig(this.props.mailbox.id, { unreadMode: unreadMode })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render: function () {
    return (
      <Paper zDepth={1} style={{ padding: 15 }}>
        <Toggle
          defaultToggled={this.props.mailbox.showUnreadBadge}
          label='Show unread badge'
          onToggle={this.handleShowUnreadBadgeChange} />
        <br />
        <Toggle
          defaultToggled={this.props.mailbox.showNotifications}
          label='Show notifications'
          onToggle={this.handleShowNotificationsChange} />
        <br />
        <SelectField
          value={this.props.mailbox.google.unreadMode}
          onChange={this.handleUnreadModeChange}
          floatingLabelText='Unread Mode'>
          <MenuItem
            key={flux.mailbox.Google.UNREAD_MODES.INBOX_UNREAD}
            value={flux.mailbox.Google.UNREAD_MODES.INBOX_UNREAD}
            primaryText='Unread Messages' />
          <MenuItem
            key={flux.mailbox.Google.UNREAD_MODES.PRIMARY_INBOX_UNREAD}
            value={flux.mailbox.Google.UNREAD_MODES.PRMARY_INBOX_UNREAD}
            primaryText='Unread Primary Messages' />
          <MenuItem
            key={flux.mailbox.Google.UNREAD_MODES.INBOX}
            value={flux.mailbox.Google.UNREAD_MODES.INBOX}
            primaryText='Messages in inbox' />
        </SelectField>
      </Paper>
    )
  }
})

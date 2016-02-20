const React = require('react')
const { SelectField, MenuItem, Paper } = require('material-ui')
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
            value={flux.mailbox.Google.UNREAD_MODES.PRIMARY_INBOX_UNREAD}
            primaryText='Unread Primary Messages' />
          <MenuItem
            key={flux.mailbox.Google.UNREAD_MODES.INBOX}
            value={flux.mailbox.Google.UNREAD_MODES}
            primaryText='Messages in inbox' />
        </SelectField>
      </Paper>
    )
  }
})

const React = require('react')
const { SelectField, MenuItem, Paper } = require('material-ui')
const flux = {
  mailbox: require('../../../stores/mailbox')
}
const Google = require('shared/Models/Mailbox/Google')

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
          fullWidth
          value={this.props.mailbox.google.unreadMode}
          onChange={this.handleUnreadModeChange}
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
            key={Google.UNREAD_MODES.INBOX}
            value={Google.UNREAD_MODES}
            primaryText='All Messages in inbox' />
        </SelectField>
      </Paper>
    )
  }
})

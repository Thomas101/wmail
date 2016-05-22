const React = require('react')
const { Paper, SelectField, MenuItem } = require('material-ui')
const flux = {
  mailbox: require('../../../stores/mailbox')
}

module.exports = React.createClass({
  displayName: 'GoogleInboxAccountSettings',

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
            key={flux.mailbox.Google.UNREAD_MODES.INBOX}
            value={flux.mailbox.Google.UNREAD_MODES.INBOX}
            primaryText='Messages in inbox' />
        </SelectField>
      </Paper>
    )
  }
})

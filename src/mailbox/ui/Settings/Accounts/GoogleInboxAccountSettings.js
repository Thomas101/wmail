const React = require('react')
const { Toggle, Paper } = require('material-ui')
const flux = {
  mailbox: require('../../../stores/mailbox')
}

/* eslint-disable react/prop-types */

module.exports = React.createClass({
  displayName: 'GoogleInboxAccountSettings',

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
      </Paper>
    )
  }
})

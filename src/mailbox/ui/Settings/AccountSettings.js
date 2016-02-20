const React = require('react')
const { SelectField, MenuItem, Paper, Toggle, Styles } = require('material-ui')
const GoogleInboxAccountSettings = require('./Accounts/GoogleInboxAccountSettings')
const GoogleMailAccountSettings = require('./Accounts/GoogleMailAccountSettings')
const flux = {
  mailbox: require('../../stores/mailbox')
}

/* eslint-disable react/prop-types */

module.exports = React.createClass({
  displayName: 'AccountSettings',

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount: function () {
    flux.mailbox.S.listen(this.mailboxesChanged)
  },

  componentWillUnmount: function () {
    flux.mailbox.S.unlisten(this.mailboxesChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState: function () {
    const store = flux.mailbox.S.getState()
    const all = store.all()
    return {
      mailboxes: all,
      selected: all[0]
    }
  },

  mailboxesChanged: function (store) {
    const all = store.all()
    if (this.state.selected) {
      this.setState({ mailboxes: all, selected: store.get(this.state.selected.id) })
    } else {
      this.setState({ mailboxes: all, selected: all[0] })
    }
  },

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  handleAccountChange: function (evt, index, mailboxId) {
    this.setState({ selected: flux.mailbox.S.getState().get(mailboxId) })
  },

  handleShowUnreadBadgeChange: function (evt, toggled) {
    flux.mailbox.A.update(this.state.selected.id, {
      showUnreadBadge: toggled
    })
  },

  handleShowNotificationsChange: function (evt, toggled) {
    flux.mailbox.A.update(this.state.selected.id, {
      showNotifications: toggled
    })
  },

  handleUnreadCountsTowardsAppUnread: function (evt, toggled) {
    flux.mailbox.A.update(this.state.selected.id, {
      unreadCountsTowardsAppUnread: toggled
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render: function () {
    let content
    if (this.state.selected) {
      let accountSpecific
      if (this.state.selected.type === flux.mailbox.M.TYPE_GINBOX) {
        accountSpecific = <GoogleInboxAccountSettings mailbox={this.state.selected} />
      } else if (this.state.selected.type === flux.mailbox.M.TYPE_GMAIL) {
        accountSpecific = <GoogleMailAccountSettings mailbox={this.state.selected} />
      }
      content = (
        <div>
          <Paper zDepth={1} style={{ padding: 15, marginBottom: 5 }}>
            <Toggle
              defaultToggled={this.state.selected.showUnreadBadge}
              label='Show unread badge'
              onToggle={this.handleShowUnreadBadgeChange} />
            <br />
            <Toggle
              defaultToggled={this.state.selected.unreadCountsTowardsAppUnread}
              label='Add unread messages to app unread count'
              onToggle={this.handleUnreadCountsTowardsAppUnread} />
            <br />
            <Toggle
              defaultToggled={this.state.selected.showNotifications}
              label='Show notifications'
              onToggle={this.handleShowNotificationsChange} />
          </Paper>
          {accountSpecific}
        </div>
      )
    } else {
      content = (
        <Paper zDepth={1} style={{ padding: 15, marginBottom: 5 }}>
          <small>No accounts available</small>
        </Paper>)
    }

    return (
      <div {...this.props}>
        <Paper zDepth={1} style={{ padding: 15, marginBottom: 10 }}>
          <SelectField
            value={this.state.selected ? this.state.selected.id : undefined}
            style={{ width: '100%' }}
            labelStyle={{ color: Styles.Colors.redA200 }}
            onChange={this.handleAccountChange}>
            {
              this.state.mailboxes.map(m => {
                return (
                  <MenuItem
                    value={m.id}
                    key={m.id}
                    primaryText={(m.email || m.name || m.id) + ' (' + m.typeName + ')' } />
                  )
              })
            }
          </SelectField>
        </Paper>
        {content}
      </div>
    )
  }
})

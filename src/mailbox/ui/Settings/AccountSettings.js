const React = require('react')
const { SelectField, MenuItem, Toggle } = require('material-ui')
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
    if (this.state.selected && store.has(this.state.selected.id)) {
      this.setState({ mailboxes: all })
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

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render: function () {
    let content
    if (this.state.selected) {
      content = (
        <div>
          <br />
          <Toggle
            defaultToggled={this.state.selected.showUnreadBadge}
            label='Show unread badge'
            onToggle={this.handleShowUnreadBadgeChange} />
        </div>
      )
    } else {
      content = (<div><small>No accounts available</small></div>)
    }

    return (
      <div {...this.props}>
        <SelectField
          value={this.state.selected ? this.state.selected.id : undefined}
          onChange={this.handleAccountChange}>
          {
            this.state.mailboxes.map(m => {
              return <MenuItem value={m.id} key={m.id} primaryText={m.email || m.name || m.id} />
            })
          }
        </SelectField>
        {content}
      </div>
    )
  }
})

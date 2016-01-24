import './mailboxListItemAdd.less'
const React = require('react')
const { IconButton, Styles, Popover, MenuItem, Menu } = require('material-ui')
const flux = {
  google: require('../../stores/google')
}

module.exports = React.createClass({
  displayName: 'mailboxListItemAdd',

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState: function () {
    return { popover: false, popoverAnchor: null }
  },

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Opens the popover
  */
  handleOpenPopover: function (evt) {
    this.setState({ popover: true, popoverAnchor: evt.currentTarget })
  },

  /**
  * Closes the popover
  */
  handleClosePopover: function () {
    this.setState({ popover: false })
  },

  /**
  * Adds an inbox mail account
  */
  handleAddInbox: function () {
    flux.google.A.authInboxMailbox()
    this.setState({ popover: false })
  },

  /**
  * Adds a gmail mail account
  */
  handleAddGmail: function () {
    flux.google.A.authGmailMailbox()
    this.setState({popover: false})
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render: function () {
    return (
      <div className="add-mailbox-control">
        <IconButton
          iconClassName="material-icons"
          tooltip="Add Mailbox"
          tooltipPosition="top-center"
          onClick={this.handleOpenPopover}
          iconStyle={{color:Styles.Colors.blueGrey400}}>
          add_circle
        </IconButton>
        <Popover open={this.state.popover}
          anchorEl={this.state.popoverAnchor}
          anchorOrigin={{horizontal: 'middle', vertical: 'center' }}
          targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
          onRequestClose={this.handleClosePopover}>
          <Menu desktop={true} onEscKeyDown={this.handleClosePopover}>
            <MenuItem primaryText="Add Inbox" onClick={this.handleAddInbox} />
            <MenuItem primaryText="Add Gmail" onClick={this.handleAddGmail} />
          </Menu>
        </Popover>
      </div>
    )
  }
})

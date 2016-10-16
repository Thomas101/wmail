const React = require('react')
const { IconButton, Popover, MenuItem, Menu } = require('material-ui')
const Colors = require('material-ui/styles/colors')
const flux = {
  google: require('../../stores/google')
}

/* eslint-disable react/prop-types */

module.exports = React.createClass({
  displayName: 'SidelistAddMailbox',

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return { popover: false, popoverAnchor: null }
  },

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Opens the popover
  */
  handleOpenPopover (evt) {
    this.setState({ popover: true, popoverAnchor: evt.currentTarget })
  },

  /**
  * Closes the popover
  */
  handleClosePopover () {
    this.setState({ popover: false })
  },

  /**
  * Adds an inbox mail account
  */
  handleAddInbox () {
    flux.google.A.authInboxMailbox()
    this.setState({ popover: false })
  },

  /**
  * Adds a gmail mail account
  */
  handleAddGmail () {
    flux.google.A.authGmailMailbox()
    this.setState({popover: false})
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render () {
    return (
      <div className='add-mailbox-control'>
        <IconButton
          iconClassName='material-icons'
          tooltip='Add Mailbox'
          tooltipPosition='top-right'
          tooltipStyles={{ left: 43, top: 26 }}
          onClick={this.handleOpenPopover}
          iconStyle={{ color: Colors.blueGrey400 }}>
          add_circle
        </IconButton>
        <Popover open={this.state.popover}
          anchorEl={this.state.popoverAnchor}
          anchorOrigin={{ horizontal: 'middle', vertical: 'center' }}
          targetOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          onRequestClose={this.handleClosePopover}>
          <Menu desktop onEscKeyDown={this.handleClosePopover}>
            <MenuItem primaryText='Add Inbox' onClick={this.handleAddInbox} />
            <MenuItem primaryText='Add Gmail' onClick={this.handleAddGmail} />
          </Menu>
        </Popover>
      </div>
    )
  }
})

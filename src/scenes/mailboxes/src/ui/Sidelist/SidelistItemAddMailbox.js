const React = require('react')
const { IconButton, Popover, MenuItem, Menu } = require('material-ui')
const Colors = require('material-ui/styles/colors')
const styles = require('./SidelistStyles')
const ReactTooltip = require('react-tooltip')
const { googleActions } = require('../../stores/google')

module.exports = React.createClass({

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SidelistItemAddMailbox',

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
    googleActions.authInboxMailbox()
    this.setState({ popover: false })
  },

  /**
  * Adds a gmail mail account
  */
  handleAddGmail () {
    googleActions.authGmailMailbox()
    this.setState({popover: false})
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { style, ...passProps } = this.props
    return (
      <div
        {...passProps}
        style={Object.assign({}, styles.itemContainer, style)}
        data-tip='Add Mailbox'>
        <IconButton
          iconClassName='material-icons'
          onClick={this.handleOpenPopover}
          iconStyle={{ color: Colors.blueGrey400 }}>
          add_circle
        </IconButton>
        <ReactTooltip place='right' type='dark' effect='solid' />
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

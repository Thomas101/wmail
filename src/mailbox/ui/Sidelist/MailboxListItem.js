import './mailboxListItem.less'
const React = require('react')
const flux = {
  mailbox: require('../../stores/mailbox'),
  google: require('../../stores/google')
}
const { Badge, Styles, Popover, Menu, MenuItem, Divider, FontIcon } = require('material-ui')
const mailboxDispatch = require('../Dispatch/mailboxDispatch')

/* eslint-disable react/prop-types */

module.exports = React.createClass({
  displayName: 'MailboxListItem',

  propTypes: {
    mailbox_id: React.PropTypes.string.isRequired
  },

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount: function () {
    this.isMounted = true
    flux.mailbox.S.listen(this.mailboxesChanged)
  },

  componentWillUnmount: function () {
    this.isMounted = false
    flux.mailbox.S.unlisten(this.mailboxesChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState: function () {
    const mailboxStore = flux.mailbox.S.getState()
    return {
      mailbox: mailboxStore.get(this.props.mailbox_id),
      isActive: mailboxStore.activeId() === this.props.mailbox_id,
      isFirst: mailboxStore.isFirst(this.props.mailbox_id),
      isLast: mailboxStore.isLast(this.props.mailbox_id),
      popover: false,
      popoverAnchor: null
    }
  },

  mailboxesChanged: function (store) {
    if (this.isMounted === false) { return }
    this.setState({
      mailbox: store.get(this.props.mailbox_id),
      isActive: store.activeId() === this.props.mailbox_id,
      isFirst: store.isFirst(this.props.mailbox_id),
      isLast: store.isLast(this.props.mailbox_id)
    })
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    if (this.state.mailbox !== nextState.mailbox) { return true }
    if (this.state.isActive !== nextState.isActive) { return true }
    if (this.state.popover !== nextState.popover) { return true }
    if (this.state.isFirst !== nextState.isFirst) { return true }
    if (this.state.isLast !== nextState.isLast) { return true }

    return false
  },

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Handles the item being clicked on
  * @param evt: the event that fired
  */
  handleClick: function (evt) {
    evt.preventDefault()
    flux.mailbox.A.changeActive(this.props.mailbox_id)
  },

  /**
  * Opens the popover
  */
  handleOpenPopover: function (evt) {
    evt.preventDefault()
    this.setState({ popover: true, popoverAnchor: evt.currentTarget })
  },

  /**
  * Closes the popover
  */
  handleClosePopover: function () {
    this.setState({ popover: false })
  },

  /**
  * Deletes this mailbox
  */
  handleDelete: function () {
    flux.mailbox.A.remove(this.props.mailbox_id)
    this.setState({ popover: false })
  },

  /**
  * Opens the inspector window for this mailbox
  */
  handleInspect: function () {
    mailboxDispatch.openDevTools(this.props.mailbox_id)
    this.setState({ popover: false })
  },

  /**
  * Reloads this mailbox
  */
  handleReload: function () {
    mailboxDispatch.reload(this.props.mailbox_id)
    this.setState({ popover: false })
  },

  /**
  * Moves this item up
  */
  handleMoveUp: function () {
    flux.mailbox.A.moveUp(this.props.mailbox_id)
    this.setState({ popover: false })
  },

  /**
  * Moves this item down
  */
  handleMoveDown: function () {
    flux.mailbox.A.moveDown(this.props.mailbox_id)
    this.setState({ popover: false })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the menu items
  * @return array of jsx elements
  */
  renderMenuItems: function () {
    const menuItems = []
    if (!this.state.isFirst) {
      menuItems.push(<MenuItem
        key='moveup'
        primaryText='Move Up'
        onClick={this.handleMoveUp}
        leftIcon={<FontIcon className='material-icons'>arrow_upward</FontIcon>} />)
    }
    if (!this.state.isLast) {
      menuItems.push(<MenuItem
        key='movedown'
        primaryText='Move Down'
        onClick={this.handleMoveDown}
        leftIcon={<FontIcon className='material-icons'>arrow_downward</FontIcon>} />)
    }
    if (!this.state.isFirst || !this.state.isLast) {
      menuItems.push(<Divider key='div-0' />)
    }
    menuItems.push(
      <MenuItem
        key='delete'
        primaryText='Delete'
        onClick={this.handleDelete}
        leftIcon={<FontIcon className='material-icons'>delete</FontIcon>} />)
    menuItems.push(<Divider key='div-1' />)
    menuItems.push(
      <MenuItem
        key='reload'
        primaryText='Reload'
        onClick={this.handleReload}
        leftIcon={<FontIcon className='material-icons'>refresh</FontIcon>} />)
    menuItems.push(
      <MenuItem
        key='insepct'
        primaryText='Inspect'
        onClick={this.handleInspect}
        leftIcon={<FontIcon className='material-icons'>bug_report</FontIcon>} />)
    return menuItems
  },

  /**
  * Renders the app
  */
  render: function () {
    const mailbox = this.state.mailbox
    if (!mailbox) { return false }

    const containerProps = {
      'className': 'mailbox' + (this.state.isActive ? ' active' : ''),
      'data-type': mailbox.type
    }
    if (mailbox.email || mailbox.name) {
      containerProps.title = [
        mailbox.email || '',
        (mailbox.name ? '(' + mailbox.name + ')' : '')
      ].join(' ')
    }

    // Generate avatar
    let innerElement
    if (mailbox.avatar || mailbox.hasCustomAvatar) {
      containerProps.className += ' avatar'
      if (mailbox.hasCustomAvatar) {
        innerElement = <img className='avatar' src={mailbox.customAvatar} />
      } else {
        innerElement = <img className='avatar' src={mailbox.avatar} />
      }
    } else {
      containerProps.className += ' index'
      innerElement = <span className='index'>{this.props.index + 1}</span>
    }

    // Generate badge
    let badgeElement
    if (mailbox.showUnreadBadge && mailbox.unread) {
      badgeElement = (
        <Badge
          badgeContent={mailbox.unread}
          className='unread-badge'
          badgeStyle={{
            backgroundColor: 'rgba(238, 54, 55, 0.95)',
            color: Styles.Colors.red50
          }}/>
      )
    }

    return (
      <div {...this.props} className='list-item' onClick={this.handleClick} onContextMenu={this.handleOpenPopover}>
        <div {...containerProps}>
          {innerElement}
          {badgeElement}
        </div>
        <Popover open={this.state.popover}
          anchorEl={this.state.popoverAnchor}
          anchorOrigin={{ horizontal: 'middle', vertical: 'center' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.handleClosePopover}>
          <Menu desktop onEscKeyDown={this.handleClosePopover}>
            {this.renderMenuItems()}
          </Menu>
        </Popover>
      </div>
    )
  }
})

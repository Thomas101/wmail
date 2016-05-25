import './mailboxListItem.less'
const React = require('react')
const flux = {
  mailbox: require('../../stores/mailbox'),
  google: require('../../stores/google')
}
const { Badge, Popover, Menu, MenuItem, Divider, FontIcon } = require('material-ui')
const Colors = require('material-ui/styles/colors')
const mailboxDispatch = require('../Dispatch/mailboxDispatch')

module.exports = React.createClass({
  displayName: 'MailboxListItem',

  propTypes: {
    mailbox_id: React.PropTypes.string.isRequired
  },

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentWillMount () {
    this.isMounted = true
    this.cssElement = document.createElement('style')
    document.head.appendChild(this.cssElement)
    flux.mailbox.S.listen(this.mailboxesChanged)
  },

  componentWillUnmount () {
    this.isMounted = false
    document.head.removeChild(this.cssElement)
    flux.mailbox.S.unlisten(this.mailboxesChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    const mailboxStore = flux.mailbox.S.getState()
    const mailbox = mailboxStore.get(this.props.mailbox_id)
    return {
      mailbox: mailbox,
      isActive: mailboxStore.activeId() === this.props.mailbox_id,
      isFirst: mailboxStore.isFirst(this.props.mailbox_id),
      isLast: mailboxStore.isLast(this.props.mailbox_id),
      popover: false,
      popoverAnchor: null
    }
  },

  mailboxesChanged (store) {
    if (this.isMounted === false) { return }
    const mailbox = store.get(this.props.mailbox_id)
    this.setState({
      mailbox: mailbox,
      isActive: store.activeId() === this.props.mailbox_id,
      isFirst: store.isFirst(this.props.mailbox_id),
      isLast: store.isLast(this.props.mailbox_id)
    })
  },

  shouldComponentUpdate (nextProps, nextState) {
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
  handleClick (evt) {
    evt.preventDefault()
    flux.mailbox.A.changeActive(this.props.mailbox_id)
  },

  /**
  * Opens the popover
  */
  handleOpenPopover (evt) {
    evt.preventDefault()
    this.setState({ popover: true, popoverAnchor: evt.currentTarget })
  },

  /**
  * Closes the popover
  */
  handleClosePopover () {
    this.setState({ popover: false })
  },

  /**
  * Deletes this mailbox
  */
  handleDelete () {
    flux.mailbox.A.remove(this.props.mailbox_id)
    this.setState({ popover: false })
  },

  /**
  * Opens the inspector window for this mailbox
  */
  handleInspect () {
    mailboxDispatch.openDevTools(this.props.mailbox_id)
    this.setState({ popover: false })
  },

  /**
  * Reloads this mailbox
  */
  handleReload () {
    mailboxDispatch.reload(this.props.mailbox_id)
    this.setState({ popover: false })
  },

  /**
  * Moves this item up
  */
  handleMoveUp () {
    flux.mailbox.A.moveUp(this.props.mailbox_id)
    this.setState({ popover: false })
  },

  /**
  * Moves this item down
  */
  handleMoveDown () {
    flux.mailbox.A.moveDown(this.props.mailbox_id)
    this.setState({ popover: false })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Updates the css styles for the mailbox
  * @param mailbox: the mailbox to update for
  */
  updateCssStyles (mailbox) {
    this.cssElement.innerHTML = `
      .mailbox-list .list-item[data-id="${mailbox.id}"] .mailbox.active {
        border-color: ${mailbox.color};
      }
      .mailbox-list .list-item[data-id="${mailbox.id}"] .mailbox:hover {
        border-color: ${mailbox.color};
      }
      .mailbox-list .list-item[data-id="${mailbox.id}"] .mailbox.active:before {
        background-color: ${mailbox.color};
      }
    `
  },

  /**
  * Renders the menu items
  * @return array of jsx elements
  */
  renderMenuItems () {
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
  render () {
    const mailbox = this.state.mailbox
    if (!mailbox) { return false }

    this.updateCssStyles(mailbox)

    // Setup the classnames
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
    if (mailbox.avatarURL || mailbox.hasCustomAvatar) {
      containerProps.className += ' avatar'
      if (mailbox.hasCustomAvatar) {
        innerElement = (
          <img
            className='avatar'
            src={flux.mailbox.S.getState().getAvatar(mailbox.customAvatar)} />
        )
      } else {
        innerElement = <img className='avatar' src={mailbox.avatarURL} />
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
            color: Colors.red50
          }} />
      )
    }

    return (
      <div
        {...this.props}
        className='list-item'
        onClick={this.handleClick}
        onContextMenu={this.handleOpenPopover}
        data-id={this.state.mailbox.id}>
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

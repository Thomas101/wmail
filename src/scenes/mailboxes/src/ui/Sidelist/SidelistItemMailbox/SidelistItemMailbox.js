const React = require('react')
const { Badge } = require('material-ui')
const { navigationDispatch } = require('../../../Dispatch')
const { mailboxStore, mailboxActions } = require('../../../stores/mailbox')
const shallowCompare = require('react-addons-shallow-compare')
const ReactTooltip = require('react-tooltip')
const styles = require('../SidelistStyles')
const SidelistItemMailboxPopover = require('./SidelistItemMailboxPopover')
const SidelistItemMailboxAvatar = require('./SidelistItemMailboxAvatar')
const SidelistItemMailboxServices = require('./SidelistItemMailboxServices')
const pkg = window.appPackage()

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SidelistItemMailbox',
  propTypes: {
    mailboxId: React.PropTypes.string.isRequired,
    index: React.PropTypes.number.isRequired,
    isFirst: React.PropTypes.bool.isRequired,
    isLast: React.PropTypes.bool.isRequired
  },

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)
    // Adding new items can cause the popover not to come up. Rebuild the tooltip
    // after a little time. Bad but seems to fix
    setTimeout(() => ReactTooltip.rebuild(), 1000)
  },

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    const mailboxState = mailboxStore.getState()
    const mailbox = mailboxState.getMailbox(this.props.mailboxId)
    return {
      mailbox: mailbox,
      isActive: mailboxState.activeMailboxId() === this.props.mailboxId,
      activeService: mailboxState.activeMailboxService(),
      popover: false,
      popoverAnchor: null,
      hovering: false
    }
  },

  mailboxesChanged (mailboxState) {
    const mailbox = mailboxState.getMailbox(this.props.mailboxId)
    this.setState({
      mailbox: mailbox,
      isActive: mailboxState.activeMailboxId() === this.props.mailboxId,
      activeService: mailboxState.activeMailboxService()
    })
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
    if (evt.metaKey) {
      navigationDispatch.openMailboxSettings(this.props.mailboxId)
    } else {
      mailboxActions.changeActive(this.props.mailboxId)
    }
  },

  /**
  * Handles opening a service
  * @param evt: the event that fired
  * @param service: the service to open
  */
  handleOpenService (evt, service) {
    evt.preventDefault()
    mailboxActions.changeActive(this.props.mailboxId, service)
  },

  /**
  * Opens the popover
  */
  handleOpenPopover (evt) {
    evt.preventDefault()
    this.setState({ popover: true, popoverAnchor: evt.currentTarget })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  /**
  * Renders the badge element
  * @param mailbox: the mailbox to render for
  * @return jsx
  */
  renderBadge (mailbox) {
    if (mailbox.showUnreadBadge && mailbox.unread) {
      const badgeContent = mailbox.unread >= 1000 ? Math.floor(mailbox.unread / 1000) + 'K+' : mailbox.unread
      return (
        <Badge
          onContextMenu={this.handleOpenPopover}
          onClick={this.handleClick}
          badgeContent={badgeContent}
          badgeStyle={styles.mailboxBadge}
          style={styles.mailboxBadgeContainer} />
      )
    } else {
      return undefined
    }
  },

  /**
  * Renders the active indicator
  * @param mailbox: the mailbox to render for
  * @param isActive: true if the mailbox is active
  * @return jsx
  */
  renderActiveIndicator (mailbox, isActive) {
    if (isActive) {
      return (
        <div
          onClick={this.handleClick}
          style={Object.assign({ backgroundColor: mailbox.color }, styles.mailboxActiveIndicator)} />
      )
    } else {
      return undefined
    }
  },

  /**
  * Renders the content for the tooltip
  * @param mailbox: the mailbox to render for
  * @return jsx
  */
  renderTooltipContent (mailbox) {
    if (!mailbox.email && !mailbox.unread) { return undefined }
    const hr = '<hr style="height: 1px; border: 0; background-image: linear-gradient(to right, #bcbcbc, #fff, #bcbcbc);" />'
    return `
      <div style="text-align:left;">
        ${mailbox.email || ''}
        ${mailbox.email && mailbox.unread ? hr : ''}
        ${mailbox.unread ? `<small>${mailbox.unread} unread message${mailbox.unread > 1 ? 's' : ''}</small>` : ''}
      </div>
    `
  },

  render () {
    if (!this.state.mailbox) { return null }
    const { mailbox, isActive, activeService, popover, popoverAnchor, hovering } = this.state
    const { index, isFirst, isLast, style, ...passProps } = this.props
    delete passProps.mailboxId

    return (
      <div
        {...passProps}
        style={Object.assign({}, styles.itemContainer, styles.mailboxItemContainer, style)}
        onMouseEnter={() => this.setState({ hovering: true })}
        onMouseLeave={() => this.setState({ hovering: false })}
        data-tip={this.renderTooltipContent(mailbox)}
        data-for={`ReactComponent-Sidelist-Item-Mailbox-${mailbox.id}`}
        data-html>
        <ReactTooltip
          id={`ReactComponent-Sidelist-Item-Mailbox-${mailbox.id}`}
          place='right'
          type='dark'
          effect='solid' />
        <SidelistItemMailboxAvatar
          onContextMenu={this.handleOpenPopover}
          isActive={isActive}
          isHovering={hovering}
          mailbox={mailbox}
          index={index}
          onClick={this.handleClick} />
        {pkg.prerelease ? (
          <SidelistItemMailboxServices
            onContextMenu={this.handleOpenPopover}
            mailbox={mailbox}
            isActiveMailbox={isActive}
            activeService={activeService}
            onOpenService={this.handleOpenService} />
        ) : undefined}
        {this.renderBadge(mailbox)}
        {this.renderActiveIndicator(mailbox, isActive)}
        <SidelistItemMailboxPopover
          mailbox={mailbox}
          isFirst={isFirst}
          isLast={isLast}
          isOpen={popover}
          anchor={popoverAnchor}
          onRequestClose={() => this.setState({ popover: false })} />
      </div>
    )
  }
})

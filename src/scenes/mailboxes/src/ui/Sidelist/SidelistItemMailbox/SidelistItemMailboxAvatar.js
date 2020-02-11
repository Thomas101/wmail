const React = require('react')
const { Avatar } = require('material-ui')
const { mailboxStore } = require('../../../stores/mailbox')
const shallowCompare = require('react-addons-shallow-compare')
const styles = require('../SidelistStyles')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SidelistItemMailboxAvatar',
  propTypes: {
    isActive: React.PropTypes.bool.isRequired,
    isHovering: React.PropTypes.bool.isRequired,
    mailbox: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    onClick: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { isActive, isHovering, mailbox, index, ...passProps } = this.props

    let url
    let children
    let backgroundColor
    const borderColor = isActive || isHovering ? mailbox.color : 'white'
    if (mailbox.hasCustomAvatar) {
      url = mailboxStore.getState().getAvatar(mailbox.customAvatarId)
      backgroundColor = 'white'
    } else if (mailbox.avatarURL) {
      url = mailbox.avatarURL
      backgroundColor = 'white'
    } else {
      children = index
      backgroundColor = mailbox.color
    }

    return (
      <Avatar
        {...passProps}
        src={url}
        size={50}
        backgroundColor={backgroundColor}
        color='white'
        draggable={false}
        style={Object.assign({ borderColor: borderColor }, styles.mailboxAvatar)}>
        {children}
      </Avatar>
    )
  }
})

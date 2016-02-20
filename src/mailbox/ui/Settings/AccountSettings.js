import './accountSettings.less'

const React = require('react')
const { SelectField, MenuItem, Paper, Toggle, Styles, RaisedButton } = require('material-ui')
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

  handleCustomAvatarChange: function (evt) {
    if (!evt.target.files[0]) { return }

    // Load the image
    const reader = new window.FileReader()
    reader.addEventListener('load', () => {
      // Get the image size
      const image = new window.Image()
      image.onload = () => {
        // Scale the image down
        const scale = 150 / (image.width > image.height ? image.width : image.height)
        const width = image.width * scale
        const height = image.height * scale

        // Resize the image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0, width, height)

        // Save it to disk
        flux.mailbox.A.setCustomAvatar(this.state.selected.id, canvas.toDataURL())
      }
      image.src = reader.result
    }, false)
    reader.readAsDataURL(evt.target.files[0])
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render: function () {
    const selected = this.state.selected
    let content
    let avatarSrc = ''
    if (selected) {
      let accountSpecific
      if (selected.type === flux.mailbox.M.TYPE_GINBOX) {
        accountSpecific = <GoogleInboxAccountSettings mailbox={selected} />
      } else if (selected.type === flux.mailbox.M.TYPE_GMAIL) {
        accountSpecific = <GoogleMailAccountSettings mailbox={selected} />
      }
      content = (
        <div>
          <Paper zDepth={1} style={{ padding: 15, marginBottom: 5 }}>
            <Toggle
              defaultToggled={selected.showUnreadBadge}
              label='Show unread badge'
              onToggle={this.handleShowUnreadBadgeChange} />
            <br />
            <Toggle
              defaultToggled={selected.unreadCountsTowardsAppUnread}
              label='Add unread messages to app unread count'
              onToggle={this.handleUnreadCountsTowardsAppUnread} />
            <br />
            <Toggle
              defaultToggled={selected.showNotifications}
              label='Show notifications'
              onToggle={this.handleShowNotificationsChange} />
            <br />
            <RaisedButton
              label='Change Account Icon'
              className='file-button'
              style={{ marginRight: 15 }}>
              <input
                type='file'
                accept='image/*'
                onChange={this.handleCustomAvatarChange}
                defaultValue={selected.customAvatar} />
            </RaisedButton>
          </Paper>
          {accountSpecific}
        </div>
      )
      if (selected.hasCustomAvatar) {
        avatarSrc = selected.customAvatar
      } else if (selected.avatar) {
        avatarSrc = selected.avatar
      }
    } else {
      content = (
        <Paper zDepth={1} style={{ padding: 15, marginBottom: 5 }}>
          <small>No accounts available</small>
        </Paper>)
    }

    return (
      <div {...this.props}>
        <Paper zDepth={1} style={{ padding: 15, marginBottom: 10 }}>
          <div className='settings-account-picker'>
            <div
              className='avatar'
              style={{ backgroundImage: 'url("' + avatarSrc + '")' }}>
            </div>
            <div className='picker-container'>
              <SelectField
                value={selected ? selected.id : undefined}
                className='picker'
                style={{ width: '100%' }}
                labelStyle={{ color: Styles.Colors.redA200 }}
                onChange={this.handleAccountChange}>
                {
                  this.state.mailboxes.map((m) => {
                    return (
                      <MenuItem
                        value={m.id}
                        key={m.id}
                        primaryText={(m.email || m.name || m.id) + ' (' + m.typeName + ')'} />
                      )
                  })
                }
              </SelectField>
            </div>
          </div>
        </Paper>
        {content}
      </div>
    )
  }
})

import './accountSettings.less'
const React = require('react')
const {
  SelectField, MenuItem,
  Paper, Toggle, RaisedButton
} = require('material-ui')
const Colors = require('material-ui/styles/colors')
const ColorPicker = require('react-color').default
const GoogleInboxAccountSettings = require('./Accounts/GoogleInboxAccountSettings')
const GoogleMailAccountSettings = require('./Accounts/GoogleMailAccountSettings')
const { Row, Col } = require('../Flexbox')
const flux = {
  mailbox: require('../../stores/mailbox')
}

/* eslint-disable react/prop-types */

module.exports = React.createClass({
  displayName: 'AccountSettings',

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    flux.mailbox.S.listen(this.mailboxesChanged)
  },

  componentWillUnmount () {
    flux.mailbox.S.unlisten(this.mailboxesChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    const store = flux.mailbox.S.getState()
    const all = store.all()
    return {
      mailboxes: all,
      selected: all[0],
      showAccountColorPicker: false
    }
  },

  mailboxesChanged (store) {
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

  handleAccountChange (evt, index, mailboxId) {
    this.setState({ selected: flux.mailbox.S.getState().get(mailboxId) })
  },

  handleShowUnreadBadgeChange (evt, toggled) {
    flux.mailbox.A.update(this.state.selected.id, {
      showUnreadBadge: toggled
    })
  },

  handleShowNotificationsChange (evt, toggled) {
    flux.mailbox.A.update(this.state.selected.id, {
      showNotifications: toggled
    })
  },

  handleUnreadCountsTowardsAppUnread (evt, toggled) {
    flux.mailbox.A.update(this.state.selected.id, {
      unreadCountsTowardsAppUnread: toggled
    })
  },

  handleAccountColorChange (col) {
    flux.mailbox.A.update(this.state.selected.id, {
      color: '#' + col.hex
    })
  },

  handleCustomAvatarChange (evt) {
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
  render () {
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
            <Row>
              <Col sm={6}>
                <Toggle
                  defaultToggled={selected.showUnreadBadge}
                  label='Show unread badge'
                  labelPosition='right'
                  onToggle={this.handleShowUnreadBadgeChange} />
                <Toggle
                  defaultToggled={selected.unreadCountsTowardsAppUnread}
                  label='Add unread messages to app unread count'
                  labelPosition='right'
                  onToggle={this.handleUnreadCountsTowardsAppUnread} />
                <Toggle
                  defaultToggled={selected.showNotifications}
                  label='Show notifications'
                  labelPosition='right'
                  onToggle={this.handleShowNotificationsChange} />
              </Col>
              <Col sm={6}>
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
                <br />
                <div>
                  <RaisedButton
                    label='Account Color'
                    onClick={() => this.setState({ showAccountColorPicker: true })} />
                  <ColorPicker
                    display={this.state.showAccountColorPicker}
                    type='swatches'
                    positionCSS={{left: 0}}
                    onClose={() => this.setState({ showAccountColorPicker: false })}
                    onChangeComplete={this.handleAccountColorChange} />
                </div>
              </Col>
            </Row>
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
                fullWidth
                labelStyle={{ color: Colors.redA200 }}
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

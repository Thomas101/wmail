const React = require('react')
const { Paper, RaisedButton } = require('material-ui')
const { ColorPickerButton } = require('../../../Components')
const mailboxActions = require('../../../stores/mailbox/mailboxActions')
const styles = require('../settingStyles')
const shallowCompare = require('react-addons-shallow-compare')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AccountAvatarSettings',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

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
        mailboxActions.setCustomAvatar(this.props.mailbox.id, canvas.toDataURL())
      }
      image.src = reader.result
    }, false)
    reader.readAsDataURL(evt.target.files[0])
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { mailbox, ...passProps } = this.props

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Icon</h1>
        <RaisedButton
          label='Change Account Icon'
          style={styles.fileInputButton}>
          <input
            type='file'
            accept='image/*'
            onChange={this.handleCustomAvatarChange}
            style={styles.fileInput} />
        </RaisedButton>
        <br />
        <div>
          <ColorPickerButton
            label='Account Colour'
            value={mailbox.color}
            onChange={(col) => mailboxActions.setColor(mailbox.id, col)} />
        </div>
      </Paper>
    )
  }
})

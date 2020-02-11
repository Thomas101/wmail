const React = require('react')
const { RaisedButton, Paper } = require('material-ui')
const shallowCompare = require('react-addons-shallow-compare')
const { Configurations } = require('../../stores/mailboxWizard')
const { Mailbox } = require('shared/Models/Mailbox')
const Colors = require('material-ui/styles/colors')

const styles = {
  introduction: {
    textAlign: 'center',
    padding: 12,
    fontSize: '110%',
    fontWeight: 'bold'
  },
  configurations: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  configuration: {
    padding: 8,
    margin: 8,
    textAlign: 'center',
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    flexBasis: '50%',
    justifyContent: 'space-between',
    cursor: 'pointer'
  },
  configurationButton: {
    display: 'block',
    margin: 12
  },
  configurationImage: {
    height: 150,
    marginTop: 8,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  configurationTechInfo: {
    color: Colors.grey500,
    fontSize: '85%'
  }
}

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'ConfigureGinboxMailboxWizard',
  propTypes: {
    onPickedConfiguration: React.PropTypes.func.isRequired
  },
  statics: {
    /**
    * Renders the title element
    * @return jsx
    */
    renderTitle () {
      return (
        <div style={styles.introduction}>
          Pick the way that you normally use Google Inbox to configure WMail
          notifications and unread counters
        </div>
      )
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { onPickedConfiguration } = this.props

    return (
      <div>
        <div style={styles.configurations}>
          <Paper
            style={styles.configuration}
            onClick={() => onPickedConfiguration(Configurations[Mailbox.TYPE_GINBOX].DEFAULT_INBOX)}>
            <div>
              <RaisedButton primary label='Unread Bundled Messages (Default)' style={styles.configurationButton} />
              <div style={Object.assign({
                backgroundImage: `url("../../images/ginbox_mode_unreadunbundled.png")`
              }, styles.configurationImage)} />
              <p>
                I'm only interested in messages in my inbox that aren't in bundles.
                This is default behaviour also seen in the iOS and Android Inbox Apps
              </p>
              <p style={styles.configurationTechInfo}>
                Unread Unbundled Messages in Inbox
              </p>
            </div>
          </Paper>
          <Paper
            style={styles.configuration}
            onClick={() => onPickedConfiguration(Configurations[Mailbox.TYPE_GINBOX].UNREAD_INBOX)}>
            <div>
              <RaisedButton primary label='All Unread Messages' style={styles.configurationButton} />
              <div style={Object.assign({
                backgroundImage: `url("../../images/ginbox_mode_inbox.png")`
              }, styles.configurationImage)} />
              <p>
                I'm interested in all unread messages in my inbox
              </p>
              <p style={styles.configurationTechInfo}>
                Unread Messages in Inbox
              </p>
            </div>
          </Paper>
        </div>
      </div>
    )
  }
})

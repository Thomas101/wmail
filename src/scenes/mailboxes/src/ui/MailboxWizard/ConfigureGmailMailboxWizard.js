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
    height: 80,
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

  displayName: 'ConfigureGmailMailboxWizard',
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
          Pick the type of inbox that you use in Gmail to configure WMail
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
            onClick={() => onPickedConfiguration(Configurations[Mailbox.TYPE_GMAIL].DEFAULT_INBOX)}>
            <div>
              <RaisedButton primary label='Categories Inbox' style={styles.configurationButton} />
              <div style={Object.assign({
                backgroundImage: `url("../../images/gmail_inbox_categories_small.png")`
              }, styles.configurationImage)} />
              <p>
                I'm only interested in unread messages in the primary category
              </p>
              <p style={styles.configurationTechInfo}>
                Unread Messages in Primary Category
              </p>
            </div>
          </Paper>
          <Paper
            style={styles.configuration}
            onClick={() => onPickedConfiguration(Configurations[Mailbox.TYPE_GMAIL].UNREAD_INBOX)}>
            <div>
              <RaisedButton primary label='Unread Inbox' style={styles.configurationButton} />
              <div style={Object.assign({
                backgroundImage: `url("../../images/gmail_inbox_unread_small.png")`
              }, styles.configurationImage)} />
              <p>
                I'm interested in all unread messages in my inbox
              </p>
              <p style={styles.configurationTechInfo}>
                All Unread Messages
              </p>
            </div>
          </Paper>
          <Paper
            style={styles.configuration}
            onClick={() => onPickedConfiguration(Configurations[Mailbox.TYPE_GMAIL].PRIORIY_INBOX)}>
            <div>
              <RaisedButton primary label='Priority Inbox' style={styles.configurationButton} />
              <div style={Object.assign({
                backgroundImage: `url("../../images/gmail_inbox_priority_small.png")`
              }, styles.configurationImage)} />
              <p>
                I'm only interested in unread messages if they are marked as important
              </p>
              <p style={styles.configurationTechInfo}>
                Unread Important Messages
              </p>
            </div>
          </Paper>
        </div>
      </div>
    )
  }
})

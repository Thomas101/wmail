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
            onClick={() => onPickedConfiguration(Configurations[Mailbox.TYPE_GINBOX].COUNT_SCRAPE)}>
            <div>
              <RaisedButton primary label='Inbox Zero (Default)' style={styles.configurationButton} />
              <div style={Object.assign({
                backgroundImage: `url("../../images/ginbox_mode_zero_small.png")`
              }, styles.configurationImage)} />
              <p>
                I like to read all my emails and mark them as done so that I only
                have a few emails in my inbox
              </p>
              <p style={styles.configurationTechInfo}>
                This will take the unread count from the user interface
              </p>
            </div>
          </Paper>
          <Paper
            style={styles.configuration}
            onClick={() => onPickedConfiguration(Configurations[Mailbox.TYPE_GINBOX].COUNT_API)}>
            <div>
              <RaisedButton primary label='Full Inbox' style={styles.configurationButton} />
              <div style={Object.assign({
                backgroundImage: `url("../../images/ginbox_mode_full_small.png")`
              }, styles.configurationImage)} />
              <p>
                I leave all my emails in my inbox and just deal with the new ones
                as they arrive
              </p>
              <p style={styles.configurationTechInfo}>
                This will take the unread count the Gmail API
              </p>
            </div>
          </Paper>
        </div>
      </div>
    )
  }
})

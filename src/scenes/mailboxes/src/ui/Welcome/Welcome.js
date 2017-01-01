const React = require('react')
const { mailboxWizardActions } = require('../../stores/mailboxWizard')
const { RaisedButton, FontIcon } = require('material-ui')
const Colors = require('material-ui/styles/colors')

const styles = {
  icon: {
    height: 80,
    width: 80,
    display: 'inline-block',
    marginLeft: 10,
    marginRight: 10,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundImage: 'url("../../icons/app_512.png")'
  },
  container: {
    textAlign: 'center',
    overflow: 'auto'
  },
  heading: {
    backgroundColor: Colors.red400,
    color: 'white',
    paddingTop: 40,
    paddingBottom: 20
  },
  headingTitle: {
    fontWeight: '200',
    fontSize: '30px',
    marginBottom: 0
  },
  headingSubtitle: {
    fontWeight: '200',
    fontSize: '18px'
  },
  setupItem: {
    marginTop: 32
  },
  setupItemExtended: {
    fontSize: '85%',
    color: Colors.grey600
  }
}

module.exports = React.createClass({

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'Welcome',

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    return (
      <div style={styles.container}>
        <div style={styles.heading}>
          <div style={styles.icon} />
          <h1 style={styles.headingTitle}>Welcome to WMail</h1>
          <h2 style={styles.headingSubtitle}>...the free and open-source desktop client for Gmail and Google Inbox</h2>
        </div>
        <div style={styles.setupItem}>
          <RaisedButton
            label='Add your first mailbox'
            icon={(<FontIcon className='material-icons'>mail_outline</FontIcon>)}
            primary
            onClick={() => mailboxWizardActions.openAddMailbox()} />
          <p style={styles.setupItemExtended}>
            Get started by adding your first Gmail or Google Inbox accout
          </p>
        </div>
      </div>
    )
  }
})

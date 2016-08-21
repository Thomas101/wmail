const React = require('react')
const { SelectField, MenuItem, Paper } = require('material-ui')
const mailboxActions = require('../../../stores/mailbox/mailboxActions')
const Google = require('shared/Models/Mailbox/Google')
const styles = require('../settingStyles')
const {
  Grid: { Container, Row, Col }
} = require('../../../Components')
const shallowCompare = require('react-addons-shallow-compare')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'GoogleMailAccountSettings',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  handleUnreadModeChange (evt, index, unreadMode) {
    mailboxActions.updateGoogleConfig(this.props.mailbox.id, { unreadMode: unreadMode })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    return (
      <Container fluid>
        <Row>
          <Col md={6}>
            <Paper zDepth={1} style={styles.paper}>
              <SelectField
                fullWidth
                value={this.props.mailbox.google.unreadMode}
                onChange={this.handleUnreadModeChange}
                floatingLabelText='Unread Mode'>
                <MenuItem
                  key={Google.UNREAD_MODES.INBOX_UNREAD}
                  value={Google.UNREAD_MODES.INBOX_UNREAD}
                  primaryText='All Unread Messages' />
                <MenuItem
                  key={Google.UNREAD_MODES.PRIMARY_INBOX_UNREAD}
                  value={Google.UNREAD_MODES.PRIMARY_INBOX_UNREAD}
                  primaryText='Unread Messages in Primary Category' />
                <MenuItem
                  key={Google.UNREAD_MODES.INBOX_UNREAD_IMPORTANT}
                  value={Google.UNREAD_MODES.INBOX_UNREAD_IMPORTANT}
                  primaryText='Unread Important Messages' />
                <MenuItem
                  key={Google.UNREAD_MODES.INBOX}
                  value={Google.UNREAD_MODES}
                  primaryText='All Messages in inbox' />
              </SelectField>
            </Paper>
          </Col>
        </Row>
      </Container>
    )
  }
})

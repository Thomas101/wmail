const React = require('react')
const {SelectField, MenuItem, Avatar, Paper} = require('material-ui')
const {
  Grid: { Container, Row, Col }
} = require('../../Components')
const mailboxStore = require('../../stores/mailbox/mailboxStore')
const styles = require('./settingStyles')

const AccountAvatarSettings = require('./Accounts/AccountAvatarSettings')
const AccountUnreadSettings = require('./Accounts/AccountUnreadSettings')
const AccountCustomCodeSettings = require('./Accounts/AccountCustomCodeSettings')
const AccountAdvancedSettings = require('./Accounts/AccountAdvancedSettings')
const AccountManagementSettings = require('./Accounts/AccountManagementSettings')

module.exports = React.createClass({
  displayName: 'AccountSettings',
  propTypes: {
    showRestart: React.PropTypes.func.isRequired,
    initialMailboxId: React.PropTypes.string
  },

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)
  },

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)
  },

  componentWillReceiveProps (nextProps) {
    if (this.props.initialMailboxId !== nextProps.initialMailboxId) {
      const mailbox = mailboxStore.getState().getMailbox(nextProps.initialMailboxId)
      if (mailbox) {
        this.setState({ selected: mailbox })
      }
    }
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    const { initialMailboxId } = this.props
    const store = mailboxStore.getState()
    const all = store.allMailboxes()
    return {
      mailboxes: all,
      selected: (initialMailboxId ? store.getMailbox(initialMailboxId) : all[0]) || all[0]
    }
  },

  mailboxesChanged (store) {
    const all = store.allMailboxes()
    if (this.state.selected) {
      this.setState({
        mailboxes: all,
        selected: store.getMailbox(this.state.selected.id) || all[0]
      })
    } else {
      this.setState({ mailboxes: all, selected: all[0] })
    }
  },

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  handleAccountChange (evt, index, mailboxId) {
    this.setState({ selected: mailboxStore.getState().getMailbox(mailboxId) })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  renderNoMailboxes () {
    const passProps = Object.assign({}, this.props)
    delete passProps.showRestart
    delete passProps.initialMailboxId

    return (
      <div {...passProps}>
        <Paper zDepth={1} style={styles.paper}>
          <small>No accounts available</small>
        </Paper>
      </div>
    )
  },

  renderMailboxes () {
    const {selected} = this.state
    const {showRestart, ...passProps} = this.props
    delete passProps.initialMailboxId

    let avatarSrc = ''
    if (selected.hasCustomAvatar) {
      avatarSrc = mailboxStore.getState().getAvatar(selected.customAvatarId)
    } else if (selected.avatarURL) {
      avatarSrc = selected.avatarURL
    }

    return (
      <div {...passProps}>
        <div style={styles.accountPicker}>
          <Avatar
            src={avatarSrc}
            size={60}
            backgroundColor='white'
            style={styles.accountPickerAvatar} />
          <div style={styles.accountPickerContainer}>
            <SelectField
              value={selected.id}
              style={{marginTop: -14}}
              floatingLabelText='Pick your account'
              fullWidth
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
        <Container fluid>
          <Row>
            <Col md={6}>
              <AccountUnreadSettings mailbox={selected} />
              <AccountAvatarSettings mailbox={selected} />
            </Col>
            <Col md={6}>
              <AccountCustomCodeSettings mailbox={selected} />
              <AccountAdvancedSettings mailbox={selected} showRestart={showRestart} />
              <AccountManagementSettings mailbox={selected} />
            </Col>
          </Row>
        </Container>
      </div>
    )
  },

  render () {
    if (this.state.mailboxes.length) {
      return this.renderMailboxes()
    } else {
      return this.renderNoMailboxes()
    }
  }
})

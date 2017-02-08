const React = require('react')
const {
  Paper, IconButton, FontIcon, FlatButton, Popover, Menu, MenuItem, Checkbox, Toggle,
  Table, TableBody, TableRow, TableRowColumn, TableHeader, TableHeaderColumn
} = require('material-ui')
const mailboxActions = require('../../../stores/mailbox/mailboxActions')
const shallowCompare = require('react-addons-shallow-compare')
const Mailbox = require('shared/Models/Mailbox/Mailbox')
const Colors = require('material-ui/styles/colors')

const settingStyles = require('../settingStyles')
const serviceStyles = {
  actionCell: {
    width: 48,
    paddingLeft: 0,
    paddingRight: 0,
    textAlign: 'center'
  },
  titleCell: {
    paddingLeft: 0,
    paddingRight: 0
  },
  avatar: {
    height: 22,
    width: 22,
    top: 2
  },
  disabled: {
    textAlign: 'center',
    fontSize: '85%',
    color: Colors.grey300
  }
}

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AccountServiceSettings',
  propTypes: {
    mailbox: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      addPopoverOpen: false,
      addPopoverAnchor: null
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  /**
  * Renders the service name
  * @param mailboxType: the type of mailbox
  * @param service: the service type
  * @return the human name for the service
  */
  getServiceName (mailboxType, service) {
    if (mailboxType === Mailbox.TYPE_GMAIL || mailboxType === Mailbox.TYPE_GINBOX) {
      switch (service) {
        case Mailbox.SERVICES.STORAGE: return 'Google Drive'
        case Mailbox.SERVICES.CONTACTS: return 'Google Contacts'
        case Mailbox.SERVICES.NOTES: return 'Google Keep'
        case Mailbox.SERVICES.CALENDAR: return 'Google Calendar'
      }
    }

    return ''
  },

  /**
  * @param mailboxType: the type of mailbox
  * @param service: the service type
  * @return the url of the service icon
  */
  getServiceIconUrl (mailboxType, service) {
    if (mailboxType === Mailbox.TYPE_GMAIL || mailboxType === Mailbox.TYPE_GINBOX) {
      switch (service) {
        case Mailbox.SERVICES.STORAGE: return '../../images/google_services/logo_drive_128px.png'
        case Mailbox.SERVICES.CONTACTS: return '../../images/google_services/logo_contacts_128px.png'
        case Mailbox.SERVICES.NOTES: return '../../images/google_services/logo_keep_128px.png'
        case Mailbox.SERVICES.CALENDAR: return '../../images/google_services/logo_calendar_128px.png'
      }
    }

    return ''
  },

  /**
  * Renders the services
  * @param mailbox: the mailbox
  * @param services: the services list
  * @param sleepableServices: the list of services that are able to sleep
  * @return jsx
  */
  renderServices (mailbox, services, sleepableServices) {
    if (services.length) {
      const sleepableServicesSet = new Set(sleepableServices)

      return (
        <Table selectable={false}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn style={serviceStyles.actionCell} />
              <TableHeaderColumn style={serviceStyles.titleCell}>Service</TableHeaderColumn>
              <TableHeaderColumn style={serviceStyles.actionCell} tooltip="Allows services to sleep to reduce memory consumption">
                Sleepable
              </TableHeaderColumn>
              <TableHeaderColumn style={serviceStyles.actionCell} />
              <TableHeaderColumn style={serviceStyles.actionCell} />
              <TableHeaderColumn style={serviceStyles.actionCell} />
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {services.map((service, index, arr) => {
              return (
                <TableRow key={service}>
                  <TableRowColumn style={serviceStyles.actionCell}>
                    <img
                      style={serviceStyles.avatar}
                      src={this.getServiceIconUrl(mailbox.type, service)} />
                  </TableRowColumn>
                  <TableRowColumn style={serviceStyles.titleCell}>
                    {this.getServiceName(mailbox.type, service)}
                  </TableRowColumn>
                  <TableRowColumn style={serviceStyles.actionCell}>
                    <Checkbox
                      onCheck={(evt, checked) => mailboxActions.toggleServiceSleepable(mailbox.id, service, checked)}
                      checked={sleepableServicesSet.has(service)} />
                  </TableRowColumn>
                  <TableRowColumn style={serviceStyles.actionCell}>
                    <IconButton
                      onClick={() => mailboxActions.moveServiceUp(mailbox.id, service)}
                      disabled={index === 0}>
                      <FontIcon className='material-icons'>arrow_upwards</FontIcon>
                    </IconButton>
                  </TableRowColumn>
                  <TableRowColumn style={serviceStyles.actionCell}>
                    <IconButton
                      onClick={() => mailboxActions.moveServiceDown(mailbox.id, service)}
                      disabled={index === arr.length - 1}>
                      <FontIcon className='material-icons'>arrow_downwards</FontIcon>
                    </IconButton>
                  </TableRowColumn>
                  <TableRowColumn style={serviceStyles.actionCell}>
                    <IconButton onClick={() => mailboxActions.removeService(mailbox.id, service)}>
                      <FontIcon className='material-icons'>delete</FontIcon>
                    </IconButton>
                  </TableRowColumn>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )
    } else {
      return (
        <Table selectable={false}>
          <TableBody displayRowCheckbox={false}>
            <TableRow>
              <TableRowColumn style={serviceStyles.disabled}>
                All Services Disabled
              </TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
      )
    }
  },

  /**
  * Renders the add popover
  * @param mailbox: the mailbox
  * @param disabledServices: the list of disabled services
  * @return jsx
  */
  renderAddPopover (mailbox, disabledServices) {
    if (disabledServices.length) {
      const { addPopoverOpen, addPopoverAnchor } = this.state
      return (
        <div style={{ textAlign: 'right' }}>
          <FlatButton
            label='Add Service'
            onClick={(evt) => this.setState({ addPopoverOpen: true, addPopoverAnchor: evt.currentTarget })} />
          <Popover
            open={addPopoverOpen}
            anchorEl={addPopoverAnchor}
            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'left', vertical: 'top'}}
            onRequestClose={() => this.setState({ addPopoverOpen: false })}>
            <Menu>
              {disabledServices.map((service) => {
                return (
                  <MenuItem
                    key={service}
                    onClick={() => {
                      this.setState({ addPopoverOpen: false })
                      mailboxActions.addService(mailbox.id, service)
                    }}
                    primaryText={this.getServiceName(mailbox.type, service)} />)
              })}
            </Menu>
          </Popover>
        </div>
      )
    } else {
      return undefined
    }
  },

  render () {
    const { mailbox, ...passProps } = this.props

    const enabledServicesSet = new Set(mailbox.enabledServies)
    const disabledServices = mailbox.supportedServices
      .filter((s) => s !== Mailbox.SERVICES.DEFAULT && !enabledServicesSet.has(s))

    return (
      <Paper zDepth={1} style={settingStyles.paper} {...passProps}>
        <h1 style={settingStyles.subheading}>Services</h1>
        {this.renderServices(mailbox, mailbox.enabledServies, mailbox.sleepableServices)}
        {this.renderAddPopover(mailbox, disabledServices)}
        <Toggle
          toggled={mailbox.compactServicesUI}
          label='Compact Services UI'
          labelPosition='right'
          onToggle={(evt, toggled) => mailboxActions.setCompactServicesUI(mailbox.id, toggled)} />
      </Paper>
    )
  }
})

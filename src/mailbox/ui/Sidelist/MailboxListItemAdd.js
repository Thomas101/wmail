import './mailboxListItemAdd.less'
const React = require('react')
const remote = window.nativeRequire('remote')
const Menu = remote.require('menu')
const flux = {
  google: require('../../stores/google')
}

module.exports = React.createClass({
  displayName: 'mailboxListItemAdd',
  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Handles the item being clicked on
  * @param evt: the event that fired
  */
  handleClick: function (evt) {
    evt.preventDefault()

    Menu.buildFromTemplate([
      {
        label: 'Add Inbox',
        click: () => {
          flux.google.A.authInboxMailbox()
        }
      },
      {
        label: 'Add Gmail',
        click: () => {
          flux.google.A.authGmailMailbox()
        }
      }
    ]).popup(remote.getCurrentWindow())
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render: function () {
    return (
    <div {...this.props} className='list-item' onClick={this.handleClick}>
        <div className='add-mailbox' title='Add Mailbox'>+</div>
      </div>
    )
  }
})

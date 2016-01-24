'use strict'

import './appContent.less'

const React = require('react')
const MailboxWindows = require('./Mailbox/MailboxWindows')
const Sidelist = require('./Sidelist')

module.exports = React.createClass({
  displayName: 'AppContent',

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render: function () {
    return (
      <div>
        <div className='master'>
          <Sidelist />
        </div>
        <div className='detail'>
          <MailboxWindows />
        </div>
      </div>
    )
  }
})

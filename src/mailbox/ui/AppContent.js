'use strict'

import './appContent.less'

const React = require('react')
const MailboxWindows = require('./Mailbox/MailboxWindows')
const Sidelist = require('./Sidelist')
const { Styles } = require('material-ui')
const appTheme = require('./appTheme')

module.exports = React.createClass({
  displayName: 'AppContent',

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext () {
    return {
      muiTheme: Styles.ThemeManager.getMuiTheme(appTheme)
    }
  },

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

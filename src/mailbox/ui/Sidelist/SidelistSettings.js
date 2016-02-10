const React = require('react')
const { IconButton, Styles } = require('material-ui')
const navigationDispatch = require('../Dispatch/navigationDispatch')

/* eslint-disable react/prop-types */

module.exports = React.createClass({
  displayName: 'SidelistSettings',

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render: function () {
    return (
      <div className='settings-control'>
        <IconButton
          iconClassName='material-icons'
          tooltip='Settings'
          tooltipPosition='top-center'
          onClick={() => navigationDispatch.openSettings()}
          iconStyle={{ color: Styles.Colors.blueGrey400 }}>
          settings
        </IconButton>
      </div>
    )
  }
})

const React = require('react')
const { IconButton } = require('material-ui')
const Colors = require('material-ui/styles/colors')
const navigationDispatch = require('../Dispatch/navigationDispatch')

module.exports = React.createClass({
  displayName: 'SidelistSettings',

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render () {
    return (
      <div className='settings-control'>
        <IconButton
          iconClassName='material-icons'
          tooltip='Settings'
          tooltipPosition='top-center'
          onClick={() => navigationDispatch.openSettings()}
          iconStyle={{ color: Colors.blueGrey400 }}>
          settings
        </IconButton>
      </div>
    )
  }
})

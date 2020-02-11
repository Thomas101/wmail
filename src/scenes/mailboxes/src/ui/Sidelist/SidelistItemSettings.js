const React = require('react')
const { IconButton } = require('material-ui')
const Colors = require('material-ui/styles/colors')
const {navigationDispatch} = require('../../Dispatch')
const styles = require('./SidelistStyles')
const ReactTooltip = require('react-tooltip')

module.exports = React.createClass({

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SidelistItemSettings',

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render () {
    const { style, ...passProps } = this.props
    return (
      <div
        {...passProps}
        style={Object.assign({}, styles.itemContainer, style)}
        data-tip='Settings'
        data-for='ReactComponent-Sidelist-Item-Settings'>
        <IconButton
          iconClassName='material-icons'
          onClick={() => navigationDispatch.openSettings()}
          iconStyle={{ color: Colors.blueGrey400 }}>
          settings
        </IconButton>
        <ReactTooltip
          id='ReactComponent-Sidelist-Item-Settings'
          place='right'
          type='dark'
          effect='solid' />
      </div>
    )
  }
})

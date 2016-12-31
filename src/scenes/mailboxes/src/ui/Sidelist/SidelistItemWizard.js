const React = require('react')
const { IconButton } = require('material-ui')
const Colors = require('material-ui/styles/colors')
const { appWizardActions } = require('../../stores/appWizard')
const styles = require('./SidelistStyles')
const ReactTooltip = require('react-tooltip')

module.exports = React.createClass({

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SidelistItemWizard',

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
        data-tip='Setup Wizard'>
        <IconButton
          iconClassName='fa fa-fw fa-magic'
          onClick={() => appWizardActions.startWizard()}
          iconStyle={{ color: Colors.yellow600 }} />
        <ReactTooltip place='right' type='dark' effect='solid' />
      </div>
    )
  }
})

const React = require('react')
const { IconButton } = require('material-ui')
const Colors = require('material-ui/styles/colors')
const styles = require('./SidelistStyles')
const ReactTooltip = require('react-tooltip')
const { mailboxWizardActions } = require('../../stores/mailboxWizard')

module.exports = React.createClass({

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SidelistItemAddMailbox',

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { style, ...passProps } = this.props
    return (
      <div
        {...passProps}
        style={Object.assign({}, styles.itemContainer, style)}
        data-tip='Add Mailbox'>
        <IconButton
          iconClassName='material-icons'
          onClick={() => mailboxWizardActions.openAddMailbox()}
          iconStyle={{ color: Colors.blueGrey400 }}>
          add_circle
        </IconButton>
        <ReactTooltip place='right' type='dark' effect='solid' />
      </div>
    )
  }
})

const React = require('react')
const { appWizardActions } = require('../../stores/appWizard')
const shallowCompare = require('react-addons-shallow-compare')
const { Dialog, RaisedButton, FontIcon, Avatar } = require('material-ui')
const Colors = require('material-ui/styles/colors')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AppWizardStart',
  propTypes: {
    isOpen: React.PropTypes.bool.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { isOpen } = this.props
    const actions = (
      <div>
        <RaisedButton
          label='Not interested'
          style={{ float: 'left' }}
          onClick={() => appWizardActions.discardWizard()} />
        <RaisedButton
          label='Later'
          onClick={() => appWizardActions.cancelWizard()} />
        <RaisedButton
          label='Setup'
          style={{ marginLeft: 8 }}
          primary
          onClick={() => appWizardActions.progressNextStep()} />
      </div>
    )

    return (
      <Dialog
        modal={false}
        actions={actions}
        open={isOpen}
        autoScrollBodyContent
        onRequestClose={() => appWizardActions.cancelWizard()}>
        <div style={{ textAlign: 'center' }}>
          <Avatar
            color={Colors.yellow600}
            backgroundColor={Colors.blueGrey900}
            icon={(<FontIcon className='fa fa-fw fa-magic' />)}
            size={80} />
          <h3>WMail Setup</h3>
          <p>
            Customise WMail to work best for you by configuring a few common settings
          </p>
          <p>
            Would you like to start now?
          </p>
        </div>
      </Dialog>
    )
  }
})

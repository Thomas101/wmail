const React = require('react')
const { appWizardActions } = require('../../stores/appWizard')
const shallowCompare = require('react-addons-shallow-compare')
const { Dialog, RaisedButton, FontIcon } = require('material-ui')
const Colors = require('material-ui/styles/colors')

const styles = {
  container: {
    textAlign: 'center'
  },
  tick: {
    color: Colors.green600,
    fontSize: '80px'
  }
}

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AppWizardComplete',
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
          label='Cancel'
          style={{ float: 'left' }}
          onClick={() => appWizardActions.cancelWizard()} />
        <RaisedButton
          label='Finish'
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
        <div style={styles.container}>
          <FontIcon className='material-icons' style={styles.tick}>check_circle</FontIcon>
          <h3>All Done!</h3>
          <p>
            You can customise the way WMail works at any time by opening the settings
          </p>
        </div>
      </Dialog>
    )
  }
})

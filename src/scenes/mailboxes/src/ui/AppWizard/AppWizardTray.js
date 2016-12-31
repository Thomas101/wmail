const React = require('react')
const { appWizardActions } = require('../../stores/appWizard')
const { settingsStore } = require('../../stores/settings')
const shallowCompare = require('react-addons-shallow-compare')
const { Dialog, RaisedButton } = require('material-ui')
const { TrayIconEditor } = require('../../Components')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AppWizardTray',
  propTypes: {
    isOpen: React.PropTypes.bool.isRequired
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsUpdated)
  },

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsUpdated)
  },

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      tray: settingsStore.getState().tray
    }
  },

  settingsUpdated (settingsState) {
    this.setState({ tray: settingsState.tray })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { isOpen } = this.props
    const { tray } = this.state

    const actions = (
      <div>
        <RaisedButton
          label='Cancel'
          style={{ float: 'left' }}
          onClick={() => appWizardActions.cancelWizard()} />
        <RaisedButton
          label='Next'
          primary
          onClick={() => appWizardActions.progressNextStep()} />
      </div>
    )

    return (
      <Dialog
        modal={false}
        title='Tray Icon'
        actions={actions}
        open={isOpen}
        autoScrollBodyContent
        onRequestClose={() => appWizardActions.cancelWizard()}>
        <p style={{ textAlign: 'center' }}>
          Customize the the tray icon so that it fits in with the other icons in your taskbar
        </p>
        <TrayIconEditor
          tray={tray}
          style={{ textAlign: 'center' }}
          trayPreviewStyles={{ margin: '0px auto' }} />
      </Dialog>
    )
  }
})

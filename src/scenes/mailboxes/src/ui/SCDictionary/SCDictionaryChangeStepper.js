const React = require('react')
const {
  Stepper, Step, StepLabel, StepContent,
  RaisedButton, FlatButton, LinearProgress
} = require('material-ui')
const scDictionaryStore = require('../../stores/scDictionary/scDictionaryStore')
const scDictionaryActions = require('../../stores/scDictionary/scDictionaryActions')
const {
  remote: {shell}
} = window.nativeRequire('electron')

const STEPS = {
  LICENSE: 0,
  DOWNLOAD: 1,
  FINISH: 2
}

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SCDictionaryChangeStepper',
  propTypes: {
    lang: React.PropTypes.string.isRequired,
    info: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    scDictionaryStore.listen(this.scDictionaryChanged)
  },

  componentWillUnmount () {
    scDictionaryStore.unlisten(this.scDictionaryChanged)
  },

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      stepIndex: STEPS.LICENSE,
      installing: scDictionaryStore.getState().isInstalling()
    }
  },

  scDictionaryChanged (store) {
    if (store.isInstalling() === false && this.state.installing === true) {
      // Auto advance step on install complete
      this.setState({
        installing: store.isInstalling(),
        stepIndex: this.state.stepIndex + 1
      })
    } else {
      this.setState({
        installing: store.isInstalling()
      })
    }
  },

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles moving to the next step
  */
  handleNext () {
    const currentStep = this.state.stepIndex
    const nextStep = currentStep + 1

    if (nextStep === STEPS.DOWNLOAD) {
      scDictionaryActions.installDictionary()
      this.setState({
        stepIndex: nextStep,
        installing: true
      })
    } else {
      this.setState({ stepIndex: nextStep })
    }
  },

  /**
  * Handles cancelling the install
  */
  handleCancel () {
    scDictionaryActions.finishDictionaryChange()
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { info } = this.props
    const { stepIndex } = this.state

    return (
      <Stepper activeStep={stepIndex} orientation='vertical'>
        <Step>
          <StepLabel>Licensing</StepLabel>
          <StepContent>
            <p>
              <span>Check you're happy with the </span>
              <a href={info.license} onClick={(evt) => { evt.preventDefault(); shell.openExternal(info.license) }}>license</a>
              <span> of the <strong>{info.name}</strong> dictionary</span>
            </p>
            <RaisedButton
              label='Next'
              disableTouchRipple
              disableFocusRipple
              primary
              onTouchTap={this.handleNext}
              style={{marginRight: 12}} />
            <FlatButton
              label='Cancel'
              disableTouchRipple
              disableFocusRipple
              onTouchTap={this.handleCancel} />
          </StepContent>
        </Step>
        <Step>
          <StepLabel>Download</StepLabel>
          <StepContent>
            <p>Downloading <strong>{info.name}</strong></p>
            <LinearProgress mode='indeterminate' />
          </StepContent>
        </Step>
        <Step>
          <StepLabel>Finish</StepLabel>
          <StepContent>
            <p>
              <span>The </span>
              <strong>{info.name}</strong>
              <span> dictionary has been downloaded and installed. To apply these changes restart the app</span>
            </p>
            <RaisedButton
              label='Finish'
              disableTouchRipple
              disableFocusRipple
              primary
              onTouchTap={this.handleCancel} />
          </StepContent>
        </Step>
      </Stepper>
    )
  }
})

const React = require('react')
const { Dialog } = require('material-ui')
const dictionariesStore = require('../../stores/dictionaries/dictionariesStore')
const DictionaryInstallStepper = require('./DictionaryInstallStepper')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'DictionaryInstallHandler',

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillMount () {
    dictionariesStore.listen(this.dictionariesChanged)
  },

  componentWillUnmount () {
    dictionariesStore.unlisten(this.dictionariesChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    const store = dictionariesStore.getState()
    return {
      isInstalling: store.isInstalling(),
      installId: store.installId()
    }
  },

  dictionariesChanged (store) {
    this.setState({
      isInstalling: store.isInstalling(),
      installId: store.installId()
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    return (
      <Dialog
        modal
        title={`Install Dictionary`}
        open={this.state.isInstalling}>
        {!this.state.isInstalling ? undefined : (
          <DictionaryInstallStepper key={this.state.installId} />
        )}
      </Dialog>
    )
  }
})

const React = require('react')
const { Dialog } = require('material-ui')
const scDictionaryStore = require('../../stores/scDictionary/scDictionaryStore')
const SCDictionaryChangeStepper = require('./SCDictionaryChangeStepper')
const remoteDictionaries = require('shared/remoteDictionaries.json')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SCDictionaryChangeHandler',

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillMount () {
    scDictionaryStore.listen(this.scDictionaryChanged)
  },

  componentWillUnmount () {
    scDictionaryStore.unlisten(this.scDictionaryChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    const store = scDictionaryStore.getState()
    return {
      isChanging: store.isChangingDictionary(),
      changingId: store.changingDictionaryId(),
      changingLang: store.changingDictionaryLang()
    }
  },

  scDictionaryChanged (store) {
    this.setState({
      isChanging: store.isChangingDictionary(),
      changingId: store.changingDictionaryId(),
      changingLang: store.changingDictionaryLang()
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const info = !this.state.isChanging ? {} : remoteDictionaries[this.state.changingLang]

    return (
      <Dialog
        modal
        title={`Install ${info.name} Dictionary`}
        open={this.state.isChanging}>
        {!this.state.isChanging ? undefined : (
          <SCDictionaryChangeStepper
            key={this.state.changingId}
            info={remoteDictionaries[this.state.changingLang]}
            lang={this.state.changingLang} />
        )}
      </Dialog>
    )
  }
})

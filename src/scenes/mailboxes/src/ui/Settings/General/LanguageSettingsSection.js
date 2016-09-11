const React = require('react')
const { Toggle, Paper, SelectField, MenuItem, RaisedButton, FontIcon } = require('material-ui')
const flux = {
  settings: require('../../../stores/settings'),
  dictionaries: require('../../../stores/dictionaries')
}
const styles = require('../settingStyles')
const shallowCompare = require('react-addons-shallow-compare')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'LanguageSettingsSection',
  propTypes: {
    language: React.PropTypes.object.isRequired,
    showRestart: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    flux.dictionaries.S.listen(this.dictionariesChanged)
  },

  componentWillUnmount () {
    flux.dictionaries.S.unlisten(this.dictionariesChanged)
  },

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      installedDictionaries: flux.dictionaries.S.getState().sortedInstalledDictionaryInfos()
    }
  },

  dictionariesChanged (store) {
    this.setState({
      installedDictionaries: flux.dictionaries.S.getState().sortedInstalledDictionaryInfos()
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const {language, showRestart, ...passProps} = this.props
    const { installedDictionaries } = this.state

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Language</h1>
        <Toggle
          toggled={language.spellcheckerEnabled}
          labelPosition='right'
          label='Spell-checker (Requires Restart)'
          onToggle={(evt, toggled) => {
            showRestart()
            flux.settings.A.setEnableSpellchecker(toggled)
          }} />
        <SelectField
          floatingLabelText='Spell-checker language'
          value={language.spellcheckerLanguage}
          fullWidth
          onChange={(evt, index, value) => { flux.settings.A.setSpellcheckerLanguage(value) }}>
          {installedDictionaries.map((info) => {
            return (<MenuItem key={info.lang} value={info.lang} primaryText={info.name} />)
          })}
        </SelectField>
        <SelectField
          floatingLabelText='Secondary Spell-checker language'
          value={language.secondarySpellcheckerLanguage !== null ? language.secondarySpellcheckerLanguage : '__none__'}
          fullWidth
          onChange={(evt, index, value) => {
            flux.settings.A.setSecondarySpellcheckerLanguage(value !== '__none__' ? value : null)
          }}>
          {[undefined].concat(installedDictionaries).map((info) => {
            if (info === undefined) {
              return (<MenuItem key='__none__' value='__none__' primaryText='None' />)
            } else {
              return (<MenuItem key={info.lang} value={info.lang} primaryText={info.name} />)
            }
          })}
        </SelectField>
        <RaisedButton
          label='Install more Dictionaries'
          icon={<FontIcon className='material-icons'>language</FontIcon>}
          onTouchTap={() => { flux.dictionaries.A.startDictionaryInstall() }} />
      </Paper>
    )
  }
})

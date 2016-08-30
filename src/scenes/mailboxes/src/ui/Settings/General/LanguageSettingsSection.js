const React = require('react')
const { Toggle, Paper, SelectField, MenuItem } = require('material-ui')
const settingsActions = require('../../../stores/settings/settingsActions')
const scDictionaryActions = require('../../../stores/scDictionary/scDictionaryActions')
const styles = require('../settingStyles')
const shallowCompare = require('react-addons-shallow-compare')
const SpellcheckManager = require('shared/SpellcheckManager')

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
  // UI Events
  /* **************************************************************************/

  handleSpellcheckerLanguageChange (evt, index, value) {
    if (value !== this.props.language.spellcheckerLanguage) {
      if (value === this.props.language.defaultSpellcheckerLanguage) {
        settingsActions.setSpellcheckerLanguage(undefined)
      } else {
        scDictionaryActions.startDictionaryChange(value)
      }
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const {language, showRestart, ...passProps} = this.props

    const allLanguages = Object.keys(SpellcheckManager.remoteDictionaries)
      .map((lang) => [lang, SpellcheckManager.remoteDictionaries[lang].name])
      .sort((a, b) => {
        if (a[1] < b[1]) return -1
        if (a[1] > b[1]) return 1
        return 0
      })

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Language</h1>
        <Toggle
          toggled={language.spellcheckerEnabled}
          labelPosition='right'
          label='Spell-checker (Requires Restart)'
          onToggle={(evt, toggled) => {
            showRestart()
            settingsActions.setEnableSpellchecker(toggled)
          }} />
        <SelectField
          floatingLabelText='Spell-checker language (Requires Restart)'
          value={language.spellcheckerLanguage}
          fullWidth
          onChange={this.handleSpellcheckerLanguageChange}>
          {allLanguages.map(([lang, name]) => {
            return (<MenuItem key={lang} value={lang} primaryText={name} />)
          })}
        </SelectField>
      </Paper>
    )
  }
})

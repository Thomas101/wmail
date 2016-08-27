const React = require('react')
const { Toggle, Paper, SelectField, MenuItem } = require('material-ui')
const settingsActions = require('../../../stores/settings/settingsActions')
const spellcheckChangeActions = require('../../../stores/spellcheckChange/spellcheckChangeActions')
const styles = require('../settingStyles')
const shallowCompare = require('react-addons-shallow-compare')
const SpellcheckManager = require('shared/SpellcheckManager')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'LanguageSettingsSection',
  propTypes: {
    language: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleSpellcheckerLanguageChange (evt, index, value) {
    if (value !== this.props.language.spellcheckerLanguage) {
      if (value === this.props.language.defaultSpellcheckerLanguage) {
        settingsActions.setSpellcheckerLanguage(undefined)
      } else {
        spellcheckChangeActions.startDictionaryChange(value)
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
    const {language, ...passProps} = this.props

    const allLanguages = Object.keys(SpellcheckManager.remoteDictionaries)
      .map((lang) => [lang, SpellcheckManager.remoteDictionaries[lang]])
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
          onToggle={(evt, toggled) => settingsActions.setEnableSpellchecker(toggled)} />
        <SelectField
          floatingLabelText='Spell-checker language (Requires Restart)'
          value={language.spellcheckerLanguage}
          onChange={this.handleSpellcheckerLanguageChange}>
          {allLanguages.map((lang) => {
            return (<MenuItem value={lang} primaryText={SpellcheckManager.remoteDictionaries[lang]} />)
          })}
        </SelectField>
      </Paper>
    )
  }
})

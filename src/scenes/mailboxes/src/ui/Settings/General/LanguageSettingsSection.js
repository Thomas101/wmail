const React = require('react')
const { Toggle, Paper } = require('material-ui')
const settingsActions = require('../../../stores/settings/settingsActions')
const styles = require('../settingStyles')
const shallowCompare = require('react-addons-shallow-compare')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'LanguageSettingsSection',
  propTypes: {
    language: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const {language, ...passProps} = this.props

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Language</h1>
        <Toggle
          toggled={language.spellcheckerEnabled}
          labelPosition='right'
          label='Spell-checker (Requires Restart)'
          onToggle={(evt, toggled) => settingsActions.setEnableSpellchecker(toggled)} />
      </Paper>
    )
  }
})

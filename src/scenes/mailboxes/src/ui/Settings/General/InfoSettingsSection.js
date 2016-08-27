const React = require('react')
const {Paper} = require('material-ui')
const styles = require('../settingStyles')
const shallowCompare = require('react-addons-shallow-compare')
const Colors = require('material-ui/styles/colors')
const {
  remote: {shell}
} = window.nativeRequire('electron')
const {
  WEB_URL,
  GITHUB_URL,
  GITHUB_ISSUE_URL
} = require('shared/constants')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'InfoSettingsSection',

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    return (
      <Paper zDepth={1} style={styles.paper} {...this.props}>
        <a
          style={{color: Colors.blue700, fontSize: '85%', marginBottom: 10, display: 'block'}}
          onClick={(evt) => { evt.preventDefault(); shell.openExternal(WEB_URL) }}
          href={WEB_URL}>WMail Website</a>
        <a
          style={{color: Colors.blue700, fontSize: '85%', marginBottom: 10, display: 'block'}}
          onClick={(evt) => { evt.preventDefault(); shell.openExternal(GITHUB_URL) }}
          href={GITHUB_URL}>WMail GitHub</a>
        <a
          style={{color: Colors.blue700, fontSize: '85%', marginBottom: 10, display: 'block'}}
          onClick={(evt) => { evt.preventDefault(); shell.openExternal(GITHUB_ISSUE_URL) }}
          href={GITHUB_ISSUE_URL}>Report a bug</a>
        <p>
          Made with ♥ by Thomas Beverley
        </p>
      </Paper>
    )
  }
})

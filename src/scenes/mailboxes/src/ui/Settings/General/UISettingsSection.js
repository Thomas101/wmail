const React = require('react')
const { Toggle, Paper } = require('material-ui')
const settingsActions = require('../../../stores/settings/settingsActions')
const styles = require('../settingStyles')
const shallowCompare = require('react-addons-shallow-compare')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'UISettingsSection',
  propTypes: {
    ui: React.PropTypes.object.isRequired,
    os: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const {ui, os, ...passProps} = this.props

    return (
      <div {...passProps}>
        <Paper zDepth={1} style={styles.paper}>
          <h1 style={styles.subheading}>User Interface</h1>
          {process.platform !== 'darwin' ? undefined : (
            <Toggle
              labelPosition='right'
              toggled={ui.showTitlebar}
              label='Show titlebar (Requires Restart)'
              onToggle={(evt, toggled) => settingsActions.setShowTitlebar(toggled)} />
            )}
          {process.platform === 'darwin' ? undefined : (
            <Toggle
              labelPosition='right'
              toggled={ui.showAppMenu}
              label='Show App Menu'
              onToggle={(evt, toggled) => settingsActions.setShowAppMenu(toggled)} />
          )}
          <Toggle
            toggled={ui.sidebarEnabled}
            label='Show sidebar'
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setEnableSidebar(toggled)} />
          <Toggle
            toggled={ui.showAppBadge}
            label='Show app unread badge'
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setShowAppBadge(toggled)} />
          <Toggle
            toggled={os.openLinksInBackground}
            label='Open links in background'
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setOpenLinksInBackground(toggled)} />
        </Paper>
      </div>
    )
  }
})

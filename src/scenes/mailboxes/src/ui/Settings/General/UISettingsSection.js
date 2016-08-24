const React = require('react')
const { Toggle, Paper } = require('material-ui')
const settingsActions = require('../../../stores/settings/settingsActions')
const styles = require('../settingStyles')
const shallowCompare = require('react-addons-shallow-compare')
const Colors = require('material-ui/styles/colors')

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
              label={(
                <span>
                  Show titlebar <small style={{color: Colors.grey400}}>Requires Restart</small>
                </span>
              )}
              onToggle={(evt, toggled) => settingsActions.setShowTitlebar(toggled)} />
            )}
          {process.platform === 'darwin' ? undefined : (
            <Toggle
              labelPosition='right'
              toggled={ui.showAppMenu}
              label={(
                <span>
                  Show App Menu <span style={{color: Colors.grey400}}>Ctrl+\</span>
                </span>
              )}
              onToggle={(evt, toggled) => settingsActions.setShowAppMenu(toggled)} />
          )}
          <Toggle
            toggled={ui.sidebarEnabled}
            label={(
              <span>
                Show sidebar
                <small style={{color: Colors.grey400}}> {process.platform === 'darwin' ? 'Ctrl+cmd+S' : 'Ctrl+alt+S'}</small>
              </span>
            )}
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

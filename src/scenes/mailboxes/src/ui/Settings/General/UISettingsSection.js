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
    os: React.PropTypes.object.isRequired,
    showRestart: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const {
      ui,
      os,
      showRestart,
      ...passProps
    } = this.props

    return (
      <div {...passProps}>
        <Paper zDepth={1} style={styles.paper}>
          <h1 style={styles.subheading}>User Interface</h1>
          {process.platform !== 'darwin' ? undefined : (
            <Toggle
              labelPosition='right'
              toggled={ui.showTitlebar}
              label='Show titlebar (Requires Restart)'
              onToggle={(evt, toggled) => {
                showRestart()
                settingsActions.setShowTitlebar(toggled)
              }} />
            )}
          {process.platform === 'darwin' ? undefined : (
            <Toggle
              labelPosition='right'
              toggled={ui.showAppMenu}
              label='Show App Menu (Ctrl+\)'
              onToggle={(evt, toggled) => settingsActions.setShowAppMenu(toggled)} />
          )}
          <Toggle
            toggled={ui.sidebarEnabled}
            label={`Show Sidebar (${process.platform === 'darwin' ? 'Ctrl+cmd+S' : 'Ctrl+shift+S'})`}
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setEnableSidebar(toggled)} />
          <Toggle
            toggled={ui.showAppBadge}
            label='Show app unread badge'
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setShowAppBadge(toggled)} />
          <Toggle
            toggled={ui.showTitlebarCount}
            label='Show titlebar unread count'
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setShowTitlebarUnreadCount(toggled)} />
          {process.platform === 'darwin' ? (
            <Toggle
              toggled={os.openLinksInBackground}
              label='Open links in background'
              labelPosition='right'
              onToggle={(evt, toggled) => settingsActions.setOpenLinksInBackground(toggled)} />
            ) : undefined}
          <Toggle
            toggled={ui.openHidden}
            label='Always Start minimized'
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setOpenHidden(toggled)} />
        </Paper>
      </div>
    )
  }
})

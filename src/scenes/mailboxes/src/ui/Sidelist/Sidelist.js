const React = require('react')
const SidelistMailboxes = require('./SidelistMailboxes')
const SidelistItemAddMailbox = require('./SidelistItemAddMailbox')
const SidelistItemSettings = require('./SidelistItemSettings')
const SidelistItemWizard = require('./SidelistItemWizard')
const SidelistItemNews = require('./SidelistItemNews')
const { settingsStore } = require('../../stores/settings')
const styles = require('./SidelistStyles')
const shallowCompare = require('react-addons-shallow-compare')

module.exports = React.createClass({

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'Sidelist',

  /* **************************************************************************/
  // Component lifecyle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsUpdated)
  },

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsUpdated)
  },

  /* **************************************************************************/
  // Data lifecyle
  /* **************************************************************************/

  getInitialState () {
    const settingsState = settingsStore.getState()
    return {
      showTitlebar: settingsState.ui.showTitlebar, // purposely don't update this, because effects are only seen after restart
      showWizard: !settingsState.app.hasSeenAppWizard,
      showNewsInSidebar: settingsState.news.showNewsInSidebar,
      hasUnopenedNewsId: settingsState.news.hasUnopenedNewsId,
      hasUpdateInfo: settingsState.news.hasUpdateInfo
    }
  },

  settingsUpdated (settingsState) {
    this.setState({
      showWizard: !settingsState.app.hasSeenAppWizard,
      showNewsInSidebar: settingsState.news.showNewsInSidebar,
      hasUnopenedNewsId: settingsState.news.hasUnopenedNewsId,
      hasUpdateInfo: settingsState.news.hasUpdateInfo
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { showTitlebar, showWizard, showNewsInSidebar, hasUnopenedNewsId, hasUpdateInfo } = this.state
    const isDarwin = process.platform === 'darwin'
    const { style, ...passProps } = this.props
    let extraItems = 0
    extraItems += showWizard ? 1 : 0
    extraItems += hasUpdateInfo && (showNewsInSidebar || hasUnopenedNewsId) ? 1 : 0

    const scrollerStyle = Object.assign({},
      styles.scroller,
      extraItems === 1 ? styles.scroller3Icons : undefined,
      extraItems === 2 ? styles.scroller4Icons : undefined,
      { top: isDarwin && !showTitlebar ? 25 : 0 }
    )
    const footerStyle = Object.assign({},
      styles.footer,
      extraItems === 1 ? styles.footer3Icons : undefined,
      extraItems === 2 ? styles.footer4Icons : undefined
    )

    return (
      <div
        {...passProps}
        style={Object.assign({}, styles.container, style)}>
        <div
          style={scrollerStyle}
          className='ReactComponent-Sidelist-Scroller'>
          <SidelistMailboxes />
        </div>
        <div style={footerStyle}>
          {showWizard ? (<SidelistItemWizard />) : undefined}
          {hasUpdateInfo && (showNewsInSidebar || hasUnopenedNewsId) ? (<SidelistItemNews />) : undefined}
          <SidelistItemAddMailbox />
          <SidelistItemSettings />
        </div>
      </div>
    )
  }
})

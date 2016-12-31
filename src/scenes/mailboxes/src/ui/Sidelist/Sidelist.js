const React = require('react')
const SidelistMailboxes = require('./SidelistMailboxes')
const SidelistItemAddMailbox = require('./SidelistItemAddMailbox')
const SidelistItemSettings = require('./SidelistItemSettings')
const SidelistItemWizard = require('./SidelistItemWizard')
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
      showWizard: !settingsState.app.hasSeenAppWizard
    }
  },

  settingsUpdated (settingsState) {
    this.setState({
      showWizard: !settingsState.app.hasSeenAppWizard
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { showTitlebar, showWizard } = this.state
    const isDarwin = process.platform === 'darwin'
    const { style, ...passProps } = this.props

    const scrollerStyle = Object.assign({},
      styles.scroller,
      showWizard ? styles.scrollerWithWizard : undefined,
      { top: isDarwin && !showTitlebar ? 25 : 0 }
    )
    const footerStyle = Object.assign({},
      styles.footer,
      showWizard ? styles.footerWithWizard : undefined
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
          <SidelistItemAddMailbox />
          <SidelistItemSettings />
        </div>
      </div>
    )
  }
})

const React = require('react')
const SidelistMailboxes = require('./SidelistMailboxes')
const SidelistItemAddMailbox = require('./SidelistItemAddMailbox')
const SidelistItemSettings = require('./SidelistItemSettings')
const { settingsStore } = require('../../stores/settings')
const styles = require('./SidelistStyles')

module.exports = React.createClass({
  displayName: 'Sidelist',

  /* **************************************************************************/
  // Data lifecyle
  /* **************************************************************************/

  getInitialState () {
    return {
      showTitlebar: settingsStore.getState().ui.showTitlebar // purposely don't update this, because effects are only seen after restart
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return false
  },

  render () {
    const { showTitlebar } = this.state
    const isDarwin = process.platform === 'darwin'
    const { style, ...passProps } = this.props

    return (
      <div
        {...passProps}
        style={Object.assign({}, styles.container, style)}>
        <div
          style={Object.assign({}, styles.scroller, { top: isDarwin && !showTitlebar ? 25 : 0 })}
          className='ReactComponent-Sidelist-Scroller'>
          <SidelistMailboxes />
        </div>
        <div style={styles.footer}>
          <SidelistItemAddMailbox />
          <SidelistItemSettings />
        </div>
      </div>
    )
  }
})

import './NewsDialog.less'

const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const { RaisedButton, Dialog, Toggle } = require('material-ui')
const { settingsActions, settingsStore } = require('../stores/settings')
const navigationDispatch = require('../Dispatch/navigationDispatch')
const WebView = require('../Components/WebView')
const {
  remote: {shell}
} = window.nativeRequire('electron')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'NewsDialog',

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsUpdated)
    navigationDispatch.on('opennews', this.handleOpen)
  },

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsUpdated)
    navigationDispatch.off('opennews', this.handleOpen)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    const settingsState = settingsStore.getState()
    return {
      feedUrl: settingsState.news.newsFeed,
      newsId: settingsState.news.newsId,
      newsLevel: settingsState.news.newsLevel,
      hasUnopenedNewsId: settingsState.news.hasUnopenedNewsId,
      hasUpdateInfo: settingsState.news.hasUpdateInfo,
      showNewsInSidebar: settingsState.news.showNewsInSidebar,
      open: this.shouldAutoOpen(settingsState.news)
    }
  },

  settingsUpdated (settingsState) {
    this.setState((prevState) => {
      const update = {
        feedUrl: settingsState.news.newsFeed,
        newsId: settingsState.news.newsId,
        newsLevel: settingsState.news.newsLevel,
        hasUnopenedNewsId: settingsState.news.hasUnopenedNewsId,
        hasUpdateInfo: settingsState.news.hasUpdateInfo,
        showNewsInSidebar: settingsState.news.showNewsInSidebar
      }

      const autoOpen = this.shouldAutoOpen(settingsState.news)
      if (autoOpen && prevState.open !== autoOpen) {
        update.open = true
      }

      return update
    })
  },

  shouldAutoOpen (news) {
    if (news.hasUnopenedNewsId && news.hasUpdateInfo && news.newsLevel === 'dialog') {
      return true
    } else {
      return false
    }
  },

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleDone (evt) {
    settingsActions.openNewsItem(this.state.newsId)
    this.setState({ open: false })
  },

  handleOpen () {
    settingsActions.openNewsItem(this.state.newsId)
    this.setState({ open: true })
  },

  handleOpenNewWindow (evt) {
    shell.openExternal(evt.url)
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { open, feedUrl, showNewsInSidebar } = this.state

    const buttons = (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '50%', textAlign: 'left', paddingTop: 8 }}>
          <Toggle
            toggled={showNewsInSidebar}
            label='Always show in sidebar'
            labelPosition='right'
            labelStyle={{ color: 'rgb(189,189,189)' }}
            onToggle={(evt, toggled) => {
              settingsActions.setShowNewsInSidebar(toggled)
            }} />
        </div>
        <div>
          <RaisedButton
            primary
            label='Done'
            onClick={this.handleDone} />
        </div>
      </div>
    )

    return (
      <Dialog
        modal={false}
        actions={buttons}
        open={open}
        onRequestClose={this.handleDone}
        bodyClassName='ReactComponent-NewsDialog-Body'>
        {open ? (
          <WebView
            src={feedUrl}
            newWindow={this.handleOpenNewWindow}
           />
        ) : undefined}
      </Dialog>
    )
  }
})

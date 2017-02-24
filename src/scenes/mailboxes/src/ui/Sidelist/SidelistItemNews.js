const React = require('react')
const { IconButton, Badge } = require('material-ui')
const Colors = require('material-ui/styles/colors')
const {navigationDispatch} = require('../../Dispatch')
const styles = require('./SidelistStyles')
const ReactTooltip = require('react-tooltip')
const { settingsStore } = require('../../stores/settings')

module.exports = React.createClass({

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SidelistItemNews',

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsUpdated)
  },

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsUpdated)
  },

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      hasUnopenedNewsId: settingsStore.getState().news.hasUnopenedNewsId,
      newsLevel: settingsStore.getState().news.newsLevel
    }
  },

  settingsUpdated (settingsState) {
    this.setState({
      hasUnopenedNewsId: settingsState.news.hasUnopenedNewsId,
      newsLevel: settingsState.news.newsLevel
    })
  },

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleClick () {
    navigationDispatch.openNews()
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { style, ...passProps } = this.props
    const { hasUnopenedNewsId, newsLevel } = this.state
    return (
      <div
        {...passProps}
        style={Object.assign({}, styles.newsItemContainer, style)}
        data-tip='WMail News'
        data-for='ReactComponent-Sidelist-Item-News'>
        <IconButton
          iconClassName='fa fa-fw fa-newspaper-o'
          onClick={this.handleClick}
          iconStyle={{ color: Colors.blueGrey400 }} />
        {hasUnopenedNewsId && newsLevel === 'notify' ? (
          <Badge
            onClick={this.handleClick}
            badgeStyle={styles.newsBadge}
            style={styles.newsBadgeContainer}
            badgeContent='New' />
        ) : undefined}
        <ReactTooltip
          id='ReactComponent-Sidelist-Item-News'
          place='right'
          type='dark'
          effect='solid' />
      </div>
    )
  }
})

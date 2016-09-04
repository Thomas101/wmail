const React = require('react')
const { Paper } = require('material-ui')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'MailboxTargetUrl',
  propTypes: {
    url: React.PropTypes.string
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { url, ...passProps } = this.props

    const className = [
      'mailbox-target-url',
      url ? 'active' : undefined
    ].concat(this.props.className).filter((c) => !!c).join(' ')
    return (
      <Paper {...passProps} className={className}>
        {url}
      </Paper>
    )
  }
})

import 'bootstrap-grid'

const React = require('react')

module.exports = React.createClass({
  displayName: 'GridRow',

  propTypes: {
    className: React.PropTypes.string,
    children: React.PropTypes.node
  },

  render () {
    return (
      <div
        {...this.props}
        className={['row', this.props.className].filter((c) => !!c).join(' ')}>
        {this.props.children}
      </div>
    )
  }
})

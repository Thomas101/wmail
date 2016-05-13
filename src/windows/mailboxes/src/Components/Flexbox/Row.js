import 'flexboxgrid'

const React = require('react')

module.exports = React.createClass({
  displayName: 'FlexboxRow',

  propTypes: {
    className: React.PropTypes.string,
    children: React.PropTypes.node
  },

  render () {
    return (
      <div
        {...this.props}
        className={'row' + (this.props.className ? ' ' + this.props.className : '')}>
        {this.props.children}
      </div>
    )
  }
})

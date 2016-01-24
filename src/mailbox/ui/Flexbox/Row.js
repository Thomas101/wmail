import 'flexboxgrid'

const React = require('react')

/* eslint-disable react/prop-types */

module.exports = React.createClass({
  displayName: 'FlexboxRow',

  render: function () {
    return (
      <div
        {...this.props}
        className={'row' + (this.props.className ? ' ' + this.props.className : '')}>
        {this.props.children}
      </div>
    )
  }
})

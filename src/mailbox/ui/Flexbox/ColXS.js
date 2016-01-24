import 'flexboxgrid'

const React = require('react')

/* eslint-disable react/prop-types */

module.exports = React.createClass({
  displayName: 'FlexboxColXS',

  render: function () {
    return (
      <div
        {...this.props}
        className={'col-xs-' + this.props.size + (this.props.className ? ' ' + this.props.className : '')}>
        {this.props.children}
      </div>
    )
  }
})

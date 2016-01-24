import 'flexboxgrid'

const React = require('react')

/* eslint-disable react/prop-types */

module.exports = React.createClass({
  displayName: 'FlexboxColLG',

  render: function () {
    return (
      <div
        {...this.props}
        className={'col-lg-' + this.props.size + (this.props.className ? ' ' + this.props.className : '')}>
        {this.props.children}
      </div>
    )
  }
})

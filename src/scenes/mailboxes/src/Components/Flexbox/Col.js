import 'flexboxgrid'

const React = require('react')

module.exports = React.createClass({
  displayName: 'FlexboxCol',

  propTypes: {
    xs: React.PropTypes.number,
    sm: React.PropTypes.number,
    md: React.PropTypes.number,
    lg: React.PropTypes.number,
    className: React.PropTypes.string,
    children: React.PropTypes.node
  },

  render () {
    let mode = 'xs'
    let size = 12
    if (this.props.xs !== undefined) {
      mode = 'xs'
      size = this.props.xs
    } else if (this.props.sm !== undefined) {
      mode = 'sm'
      size = this.props.sm
    } else if (this.props.md !== undefined) {
      mode = 'md'
      size = this.props.md
    } else if (this.props.lg !== undefined) {
      mode = 'lg'
      size = this.props.lg
    }

    const className = ['col', mode, size].join('-') + (this.props.className ? ' ' + this.props.className : '')

    return (
      <div
        {...this.props}
        className={className}>
        {this.props.children}
      </div>
    )
  }
})

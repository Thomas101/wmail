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
    const {xs, sm, md, lg, className, children, ...passProps} = this.props

    let mode = 'xs'
    let size = 12
    if (xs !== undefined) {
      mode = 'xs'
      size = xs
    } else if (sm !== undefined) {
      mode = 'sm'
      size = sm
    } else if (md !== undefined) {
      mode = 'md'
      size = md
    } else if (lg !== undefined) {
      mode = 'lg'
      size = lg
    }

    return (
      <div
        {...passProps}
        className={['col', mode, size].join('-') + (className ? ' ' + className : '')}>
        {children}
      </div>
    )
  }
})

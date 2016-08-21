import 'bootstrap-grid'

const React = require('react')

module.exports = React.createClass({
  displayName: 'GridCol',

  propTypes: {
    xs: React.PropTypes.number,
    sm: React.PropTypes.number,
    md: React.PropTypes.number,
    lg: React.PropTypes.number,
    offset: React.PropTypes.number,
    className: React.PropTypes.string,
    children: React.PropTypes.node
  },

  render () {
    const {xs, sm, md, lg, offset, className, children, ...passProps} = this.props

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

    const classNames = [
      ['col', mode, size].join('-'),
      offset !== undefined ? ['col', mode, 'offset', size].join('-') : undefined,
      className
    ].filter((c) => !!c).join(' ')

    return (
      <div {...passProps} className={classNames}>
        {children}
      </div>
    )
  }
})

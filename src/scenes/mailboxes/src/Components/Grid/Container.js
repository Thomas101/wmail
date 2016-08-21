import 'bootstrap-grid'

const React = require('react')

module.exports = React.createClass({
  displayName: 'GridContainer',

  propTypes: {
    className: React.PropTypes.string,
    children: React.PropTypes.node,
    fluid: React.PropTypes.bool
  },

  render () {
    const {fluid, className, ...passProps} = this.props

    const classNames = [
      fluid ? 'container-fluid' : 'conainer',
      className
    ].filter((c) => !!c).join(' ')

    return (
      <div {...passProps} className={classNames}>
        {this.props.children}
      </div>
    )
  }
})

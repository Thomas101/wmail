const React = require('react')
const TrayRenderer = require('./TrayRenderer')
const shallowCompare = require('react-addons-shallow-compare')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'TrayPreview',
  propTypes: {
    config: React.PropTypes.object.isRequired,
    size: React.PropTypes.number.isRequired
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillMount () {
    TrayRenderer.renderPNGDataImage(this.props.config)
      .then((png) => this.setState({ image: png }))
  },

  componentWillReceiveProps (nextProps) {
    if (shallowCompare(this, nextProps, this.state)) {
      TrayRenderer.renderPNGDataImage(nextProps.config)
        .then((png) => this.setState({ image: png }))
    }
  },

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState () {
    return { image: null }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    return (
      <div style={{
        width: this.props.size,
        height: this.props.size,
        backgroundImage: 'linear-gradient(45deg, #CCC 25%, transparent 25%, transparent 75%, #CCC 75%, #CCC), linear-gradient(45deg, #CCC 25%, transparent 25%, transparent 75%, #CCC 75%, #CCC)',
        backgroundSize: '30px 30px',
        backgroundPosition: '0 0, 15px 15px',
        boxShadow: 'inset 0px 0px 10px 0px rgba(0,0,0,0.75)'
      }}>
        {!this.state.image ? undefined : (
          <img
            src={this.state.image}
            width={this.props.size + 'px'}
            height={this.props.size + 'px'} />
        )}
      </div>
    )
  }
})

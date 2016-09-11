const React = require('react')
const { RaisedButton, Popover } = require('material-ui')
const { ChromePicker } = require('react-color')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'ColorPickerButton',
  propTypes: {
    value: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    anchorOrigin: React.PropTypes.object.isRequired,
    targetOrigin: React.PropTypes.object.isRequired,
    icon: React.PropTypes.node,
    onChange: React.PropTypes.func
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      open: false,
      anchor: null
    }
  },

  getDefaultProps () {
    return {
      label: 'Pick Colour',
      disabled: false,
      anchorOrigin: {horizontal: 'left', vertical: 'bottom'},
      targetOrigin: {horizontal: 'left', vertical: 'top'}
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { label, disabled, onChange, anchorOrigin, targetOrigin, icon, ...passProps } = this.props
    return (
      <div {...passProps}>
        <RaisedButton
          icon={icon}
          label={label}
          disabled={disabled}
          onClick={(evt) => this.setState({ open: true, anchor: evt.target })} />
        <Popover
          anchorOrigin={anchorOrigin}
          targetOrigin={targetOrigin}
          anchorEl={this.state.anchor}
          open={this.state.open}
          onRequestClose={() => this.setState({open: false})}>
          <ChromePicker
            color={this.props.value}
            onChangeComplete={(col) => {
              if (onChange) {
                onChange(Object.assign({}, col, {
                  rgbaStr: `rgba(${col.rgb.r}, ${col.rgb.g}, ${col.rgb.b}, ${col.rgb.a})`
                }))
              }
            }} />
        </Popover>
      </div>
    )
  }
})

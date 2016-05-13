const React = require('react')
const { RaisedButton, Popover } = require('material-ui')
const { SwatchesPicker } = require('react-color')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'ColorPickerButton',
  propTypes: {
    value: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    disabled: React.PropTypes.bool.isRequired,
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
      disabled: false
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { label, disabled, onChange, ...passProps } = this.props
    return (
      <div {...passProps}>
        <RaisedButton
          label={label}
          disabled={disabled}
          onClick={(evt) => this.setState({ open: true, anchor: evt.target })} />
        <Popover
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          anchorEl={this.state.anchor}
          open={this.state.open}
          onRequestClose={() => this.setState({open: false})}>
          <SwatchesPicker
            color={this.props.value}
            onChangeComplete={(col) => {
              this.setState({ open: false })
              if (onChange) {
                setTimeout(() => { onChange(col) }, 100)
              }
            }} />
        </Popover>
      </div>
    )
  }
})

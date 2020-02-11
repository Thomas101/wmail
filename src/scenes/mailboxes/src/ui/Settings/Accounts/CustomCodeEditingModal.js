const React = require('react')
const { RaisedButton, FlatButton, Dialog, TextField } = require('material-ui')
const shallowCompare = require('react-addons-shallow-compare')
const uuid = require('uuid')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'CustomCodeEditingModal',
  propTypes: {
    title: React.PropTypes.string,
    open: React.PropTypes.bool.isRequired,
    code: React.PropTypes.string,
    onCancel: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (this.props.open !== nextProps.open) {
      this.setState({ editingKey: uuid.v4() })
    }
  },

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      editingKey: uuid.v4()
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const actions = [
      (<FlatButton
        key='cancel'
        label='Cancel'
        style={{ marginRight: 8 }}
        onTouchTap={(evt) => this.props.onCancel(evt)} />),
      (<RaisedButton
        key='save'
        label='Save'
        primary
        onTouchTap={(evt) => this.props.onSave(evt, this.refs.editor.getValue())} />)
    ]

    return (
      <Dialog
        modal
        title={this.props.title}
        actions={actions}
        open={this.props.open}>
        <TextField
          key={this.state.editingKey}
          ref='editor'
          name='editor'
          multiLine
          defaultValue={this.props.code}
          rows={10}
          rowsMax={10}
          textareaStyle={{
            margin: 0,
            fontFamily: 'monospace',
            fontSize: '12px',
            lineHeight: '14px',
            border: '1px solid rgb(224, 224, 224)',
            borderRadius: 3
          }}
          underlineShow={false}
          fullWidth />
      </Dialog>
    )
  }
})

const React = require('react')
const { Paper, TextField, IconButton } = require('material-ui')
const Colors = require('material-ui/styles/colors')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'MailboxSearch',
  propTypes: {
    onSearchChange: React.PropTypes.func,
    onSearchNext: React.PropTypes.func,
    onSearchCancel: React.PropTypes.func
  },

  /* **************************************************************************/
  // Data lifecylce
  /* **************************************************************************/

  getInitialState () {
    return {
      searchQuery: ''
    }
  },

  /* **************************************************************************/
  // Actions
  /* **************************************************************************/

  /**
  * Focuses the textfield
  */
  focus () { this.refs.textField.focus() },

  /**
  * @return the current search query
  */
  searchQuery () { return this.state.searchQuery },

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  /**
  * Handles the input string changing
  */
  handleChange (evt) {
    this.setState({searchQuery: evt.target.value})
    if (this.props.onSearchChange) {
      this.props.onSearchChange(evt.target.value)
    }
  },

  /**
  * Handles the find next command
  */
  handleFindNext () {
    if (this.props.onSearchNext) {
      this.props.onSearchNext(this.state.searchQuery)
    }
  },

  /**
  * Handles the search stopping
  */
  handleStopSearch () {
    this.setState({searchQuery: ''})
    if (this.props.onSearchCancel) {
      this.props.onSearchCancel()
    }
  },

  /**
  * Handles a key being pressed
  * @param evt: the event that fired
  */
  handleKeyPress (evt) {
    if (evt.keyCode === 13) {
      evt.preventDefault()
      this.handleFindNext()
    } else if (evt.keyCode === 27) {
      evt.preventDefault()
      this.handleStopSearch()
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render () {
    const passProps = Object.assign({}, this.props)
    delete passProps.onSearchCancel
    delete passProps.onSearchChange
    delete passProps.onSearchNext

    return (
      <Paper {...passProps}>
        <TextField
          ref='textField'
          hintText='Search'
          style={{ marginLeft: 15 }}
          inputStyle={{ width: 200 }}
          value={this.state.searchQuery}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyPress} />
        <IconButton
          iconClassName='material-icons'
          style={{ bottom: -7 }}
          iconStyle={{ color: Colors.grey600 }}
          onClick={this.handleFindNext}>
          search
        </IconButton>
        <IconButton
          iconClassName='material-icons'
          style={{ bottom: -7, zIndex: 1 }}
          iconStyle={{ color: Colors.grey600 }}
          onClick={this.handleStopSearch}>
          close
        </IconButton>
      </Paper>
    )
  }
})

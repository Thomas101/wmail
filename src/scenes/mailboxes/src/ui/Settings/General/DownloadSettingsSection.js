const React = require('react')
const ReactDOM = require('react-dom')
const { Toggle, Paper, RaisedButton, FontIcon } = require('material-ui')
const settingsActions = require('../../../stores/settings/settingsActions')
const styles = require('../settingStyles')
const shallowCompare = require('react-addons-shallow-compare')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'DownloadSettingsSection',
  propTypes: {
    os: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    ReactDOM.findDOMNode(this.refs.defaultDownloadInput).setAttribute('webkitdirectory', 'webkitdirectory')
  },

  componentDidUpdate () {
    ReactDOM.findDOMNode(this.refs.defaultDownloadInput).setAttribute('webkitdirectory', 'webkitdirectory')
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const {os, ...passProps} = this.props

    return (
      <Paper zDepth={1} style={styles.paper} {...passProps}>
        <h1 style={styles.subheading}>Downloads</h1>
        <div>
          <Toggle
            toggled={os.alwaysAskDownloadLocation}
            label='Always ask download location'
            labelPosition='right'
            onToggle={(evt, toggled) => settingsActions.setAlwaysAskDownloadLocation(toggled)} />
        </div>
        <div style={Object.assign({}, styles.button, { display: 'flex', alignItems: 'center' })}>
          <RaisedButton
            label='Select location'
            icon={<FontIcon className='material-icons'>folder</FontIcon>}
            containerElement='label'
            disabled={os.alwaysAskDownloadLocation}
            style={styles.fileInputButton}>
            <input
              type='file'
              style={styles.fileInput}
              ref='defaultDownloadInput'
              disabled={os.alwaysAskDownloadLocation}
              onChange={(evt) => settingsActions.setDefaultDownloadLocation(evt.target.files[0].path)} />
          </RaisedButton>
          {os.alwaysAskDownloadLocation ? undefined : <small>{os.defaultDownloadLocation}</small>}
        </div>
      </Paper>
    )
  }
})

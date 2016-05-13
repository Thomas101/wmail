import './layout.less'
import './Components/fileButton.less'

const React = require('react')
const ReactDOM = require('react-dom')
const App = require('./ui/App')
const mailboxActions = require('./stores/mailbox/mailboxActions')
const settingsActions = require('./stores/settings/settingsActions')
const ipc = window.nativeRequire('electron').ipcRenderer

// Load what we have in the db
mailboxActions.load()
settingsActions.load()

// Render and prepare for unrender
ReactDOM.render(<App />, document.getElementById('app'))
ipc.on('prepare-reload', function () {
  ReactDOM.unmountComponentAtNode(document.getElementById('app'))
})

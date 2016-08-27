const React = require('react')
const ReactDOM = require('react-dom')
const App = require('./ui/App')
const mailboxActions = require('./stores/mailbox/mailboxActions')
const settingsActions = require('./stores/settings/settingsActions')
const ipc = window.nativeRequire('electron').ipcRenderer

// See if we're offline and run a re-direct
if (window.navigator.onLine === false) {
  window.location.href = 'offline.html'
}

// Load what we have in the db
mailboxActions.load()
settingsActions.load()

// Remove loading
;(() => {
  const loading = document.getElementById('loading')
  loading.parentElement.removeChild(loading)
})()

// Render and prepare for unrender
ReactDOM.render(<App />, document.getElementById('app'))
ipc.on('prepare-reload', function () {
  ReactDOM.unmountComponentAtNode(document.getElementById('app'))
})

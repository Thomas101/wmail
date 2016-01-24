import './layout.less'

const React = require('react')
const ReactDOM = require('react-dom')
const App = require('./ui/App')
const mailboxActions = require('./stores/mailbox/mailboxActions')
const settingsActions = require('./stores/settings/settingsActions')

// Load what we have in the db
mailboxActions.load()
settingsActions.load()

ReactDOM.render(<App />, document.getElementById('app'))

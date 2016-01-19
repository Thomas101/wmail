import './layout.less'

const React = require('react')
const ReactDOM = require('react-dom')
const App = require('./ui/App')
const mailboxActions = require('./stores/mailbox/mailboxActions')

// Load what we have in the db
mailboxActions.load()

ReactDOM.render(<App />, document.getElementById('app'))

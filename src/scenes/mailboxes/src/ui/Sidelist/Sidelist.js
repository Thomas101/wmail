'use strict'

import './sidelist.less'

const React = require('react')
const Colors = require('material-ui/styles/colors')
const MailboxList = require('./MailboxList')
const SidelistAddMailbox = require('./SidelistAddMailbox')
const SidelistSettings = require('./SidelistSettings')

module.exports = React.createClass({
  displayName: 'Sidelist',

  /* **************************************************************************/
  // Data lifecyle
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return false
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render () {
    const { style, ...passProps } = this.props
    return (
      <div
        {...passProps}
        style={Object.assign({
          backgroundColor: Colors.blueGrey900,
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }, style)}>
        <MailboxList />
        <SidelistAddMailbox />
        <SidelistSettings />
      </div>
    )
  }
})

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
    const { style, className, ...passProps } = this.props
    return (
      <div
        {...passProps}
        style={Object.assign({ backgroundColor: Colors.blueGrey900 }, style)}
        className={'absfill ' + (className || '')}>
        <MailboxList />
        <SidelistAddMailbox />
        <SidelistSettings />
      </div>
    )
  }
})

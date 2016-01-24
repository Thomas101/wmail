'use strict'

const React = require('react')
const { Styles } = require('material-ui')
const MailboxList = require('./MailboxList')
const MailboxListItemAdd = require('./MailboxListItemAdd')

/* eslint-disable react/prop-types */

module.exports = React.createClass({
  displayName: 'Sidelist',

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render: function () {
    const { style, className, ...passProps } = this.props
    return (
      <div
        {...passProps}
        style={Object.assign({ backgroundColor: Styles.Colors.blueGrey900 }, style)}
        className={'absfill ' + (className || '')}>
        <MailboxList />
        <MailboxListItemAdd />
      </div>
    )
  }
})

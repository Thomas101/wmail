'use strict'

const { Spacing, zIndex } = require('material-ui/styles')
const Colors = require('material-ui/styles/colors')
const colorManipulator = require('material-ui/utils/colorManipulator')
const getMuiTheme = require('material-ui/styles/getMuiTheme').default

module.exports = getMuiTheme({
  spacing: Spacing,
  zIndex: zIndex,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: Colors.lightBlue600,
    primary2Color: Colors.lightBlue500,
    primary3Color: Colors.blueGrey100,
    accent1Color: Colors.redA200,
    accent2Color: Colors.grey100,
    accent3Color: Colors.grey600,
    textColor: Colors.darkBlack,
    alternateTextColor: Colors.white,
    canvasColor: Colors.white,
    borderColor: Colors.grey300,
    disabledColor: colorManipulator.fade(Colors.darkBlack, 0.3),
    pickerHeaderColor: Colors.cyan500
  }
})

'use strict'

const { Styles, Utils } = require('material-ui')
const { Colors, Spacing, zIndex } = Styles
const { ColorManipulator } = Utils

module.exports = Object.freeze({
  spacing: Spacing,
  zIndex: zIndex,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: Colors.lightBlue600,
    primary2Color: Colors.lightBlue500,
    primary3Color: Colors.lightBlue100,
    accent1Color: Colors.redA200,
    accent2Color: Colors.grey100,
    accent3Color: Colors.grey600,
    textColor: Colors.darkBlack,
    alternateTextColor: Colors.white,
    canvasColor: Colors.white,
    borderColor: Colors.grey300,
    disabledColor: ColorManipulator.fade(Colors.darkBlack, 0.3),
    pickerHeaderColor: Colors.cyan500
  }
})

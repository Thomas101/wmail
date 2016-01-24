'use strict'

const { Styles, Utils } = require('material-ui')
const { Colors, Spacing, zIndex } = Styles
const { ColorManipulator } = Utils

module.exports = Object.freeze({
  spacing: Spacing,
  zIndex: zIndex,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: Colors.blue600,
    primary2Color: Colors.blue400,
    primary3Color: Colors.blue100,
    accent1Color: Colors.amberA400,
    accent2Color: Colors.grey900,
    accent3Color: Colors.grey600,
    textColor: Colors.darkBlack,
    alternateTextColor: Colors.white,
    canvasColor: Colors.white,
    borderColor: Colors.grey300,
    disabledColor: ColorManipulator.fade(Colors.darkBlack, 0.3),
    pickerHeaderColor: Colors.cyan500
  }
})

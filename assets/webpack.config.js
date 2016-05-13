const path = require('path')
const ROOT_DIR = path.resolve(path.join(__dirname, '../'))
const BIN_DIR = path.join(ROOT_DIR, 'bin')
const devRequire = (n) => require(path.join(ROOT_DIR, 'node_modules', n))

const CleanWebpackPlugin = devRequire('clean-webpack-plugin')
const CopyWebpackPlugin = devRequire('copy-webpack-plugin')

module.exports = {
  output: {
    path: BIN_DIR,
    filename: '__.js'
  },
  plugins: [
    new CleanWebpackPlugin(['fonts', 'icons'], {
      root: BIN_DIR,
      verbose: true,
      dry: false
    }),
    new CopyWebpackPlugin([
      { from: path.join(__dirname, 'fonts'), to: 'fonts', force: true },
      { from: path.join(__dirname, 'icons'), to: 'icons', force: true }
    ], {
      ignore: [ '.DS_Store' ]
    })
  ]
}

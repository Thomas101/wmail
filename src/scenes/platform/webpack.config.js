const path = require('path')
const ROOT_DIR = path.resolve(path.join(__dirname, '../../../'))
const BIN_DIR = path.join(ROOT_DIR, 'bin')
const OUT_DIR = path.join(BIN_DIR, 'windows/platform')
const devRequire = (n) => require(path.join(ROOT_DIR, 'node_modules', n))

const CleanWebpackPlugin = devRequire('clean-webpack-plugin')
const CopyWebpackPlugin = devRequire('copy-webpack-plugin')

module.exports = {
  output: {
    path: OUT_DIR,
    filename: '__.js'
  },
  plugins: [
    new CleanWebpackPlugin([path.relative(BIN_DIR, OUT_DIR)], {
      root: BIN_DIR,
      verbose: true,
      dry: false
    }),
    new CopyWebpackPlugin([
      { from: path.join(__dirname, 'src'), to: '', force: true }
    ], {
      ignore: [ '.DS_Store' ]
    })
  ]
}

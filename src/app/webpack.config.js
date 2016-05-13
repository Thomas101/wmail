const path = require('path')
const ROOT_DIR = path.resolve(path.join(__dirname, '../../'))
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
    new CleanWebpackPlugin(['app'], {
      root: BIN_DIR,
      verbose: true,
      dry: false
    }),
    new CopyWebpackPlugin([
      { from: path.join(__dirname, 'src'), to: 'app', force: true },
      { from: path.join(__dirname, 'node_modules'), to: 'app/node_modules', force: true },
      { from: path.join(__dirname, '../shared/'), to: 'app/shared', force: true },
      { from: path.join(ROOT_DIR, 'package.json'), to: 'app', force: true}
    ], {
      ignore: [ '.DS_Store' ]
    })
  ]
}

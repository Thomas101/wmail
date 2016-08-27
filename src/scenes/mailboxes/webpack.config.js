const path = require('path')
const ROOT_DIR = path.resolve(path.join(__dirname, '../../../'))
const BIN_DIR = path.join(ROOT_DIR, 'bin')
const OUT_DIR = path.join(BIN_DIR, 'scenes/mailboxes')
const devRequire = (n) => require(path.join(ROOT_DIR, 'node_modules', n))

const webpack = devRequire('webpack')
const CopyWebpackPlugin = devRequire('copy-webpack-plugin')
const webpackTargetElectronRenderer = devRequire('webpack-target-electron-renderer')
const CleanWebpackPlugin = devRequire('clean-webpack-plugin')

const isProduction = process.env.NODE_ENV === 'production'

const options = {
  devtool: isProduction ? undefined : (process.env.WEBPACK_DEVTOOL || 'source-map'),
  entry: {
    mailboxes: [
      path.join(__dirname, 'src')
    ]
  },
  output: {
    path: OUT_DIR,
    filename: 'mailboxes.js'
  },
  plugins: [
    // Clean out our bin dir
    new CleanWebpackPlugin([path.relative(BIN_DIR, OUT_DIR)], {
      root: BIN_DIR,
      verbose: true,
      dry: false
    }),

    // Ignore electron modules and other modules we don't want to compile in
    new webpack.IgnorePlugin(new RegExp('^(electron)$')),

    // Copy our static assets
    new CopyWebpackPlugin([
      { from: path.join(__dirname, 'src/mailboxes.html'), to: 'mailboxes.html', force: true },
      { from: path.join(__dirname, 'src/offline.html'), to: 'offline.html', force: true }
    ], {
      ignore: [ '.DS_Store' ]
    }),

    // Minify in production
    isProduction ? new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    }) : undefined
  ].filter((p) => !!p),
  resolve: {
    extensions: ['', '.js', '.jsx', '.less', '.css'],
    alias: {
      shared: path.resolve(path.join(__dirname, '../../shared'))
    },
    root: [
      __dirname,
      path.resolve(path.join(__dirname, 'src'))
    ],
    modulesDirectories: [path.join(__dirname, 'node_modules')]
  },
  module: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel',
        exclude: /node_modules/,
        include: [
          __dirname,
          path.resolve(path.join(__dirname, '../../shared'))
        ],
        query: {
          cacheDirectory: true,
          presets: ['react', 'stage-0', 'es2015']
        }
      },
      {
        test: /(\.less|\.css)$/,
        loaders: ['style', 'css', 'less']
      },
      {
        test: /(\.json)$/,
        loader: 'json'
      }
    ]
  }
}

options.target = webpackTargetElectronRenderer(options)
module.exports = options

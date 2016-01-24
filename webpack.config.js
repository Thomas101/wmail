'use strict'

const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpackTargetElectronRenderer = require('webpack-target-electron-renderer')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const clientFast = process.argv.findIndex(a => a.toLowerCase() === '--clientfast') !== -1

const options = {
  devtool: clientFast ? 'eval-cheap-module-source-map' : 'source-map',
  entry: {
    mailbox: [
      'src/shared/',
      'src/mailbox/'
    ],
    vendor: [
      'appdirectory',
      'compare-version'
    ]
  },
  plugins: [
    // Clean out our bin dir
    new CleanWebpackPlugin(clientFast ? [] : ['bin'], {
      verbose: true,
      dry: false
    }),

    // Optimize files for productions
    new webpack.optimize.CommonsChunkPlugin(/* chunkName= */'vendor', /* filename= */'vendor.bundle.js'),

    // Ignore electron modules and other modules we don't want to compile in
    new webpack.IgnorePlugin(new RegExp('^(googleapis|electron)$')),

    // Copy our static assets
    new CopyWebpackPlugin(
      clientFast ? [
        { from: 'src/mailbox/mailbox.html', to: 'mailbox.html', force: true }
      ] : [
      { from: 'src/main/', to: 'main', force: true },
      { from: 'src/shared/', to: 'shared', force: true },
      { from: 'package.json', to: '', force: true },
      { from: 'src/mailbox/mailbox.html', to: 'mailbox.html', force: true },
      { from: 'src/native', to: 'native', force: true },
      { from: 'src/fonts/', to: 'fonts', force: true }
      ], {
        ignore: [ '.DS_Store' ]
      })
  ],
  output: {
    path: './bin',
    filename: 'mailbox.js',
    publicPath: './bin/'
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.less', '.css'],
    root: [__dirname, 'vendor', 'src'],
    modulesDirectories: ['node_modules']
  },
  module: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel',
        exclude: /node_modules/,
        include: __dirname,
        query: {
          cacheDirectory: true,
          presets: ['react', 'stage-0', 'es2015']
        }
      },
      {
        test: /(\.less|\.css)$/,
        loaders: ['style', 'css', 'less']
      }
      /* ,{
        test: /\.(ttf|eot|svg|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
        query: {
          name: 'fonts/[name].[ext]?_=[hash]'
        }
      },
      {
        test: /images\/(.*)\.(png|jpg|jpeg)$/,
        loader: 'url-loader',
        query: {
          limit:8192,
          name: 'images/[name].[ext]?_=[hash]'
        }
      }*/
    ]
  }
}

options.target = webpackTargetElectronRenderer(options)
module.exports = options

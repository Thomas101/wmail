var webpack = require("webpack")
var path = require('path')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer')

var options = {
  devtool: 'source-map',
  target: 'electron',
  entry: {
    mailbox       : [
      'src/shared/',
      'src/mailbox/'
    ],
    vendor        : [
      'appdirectory',
      'compare-version',
      'src/mailbox/vendor/sprint.js'
    ]
  },
  plugins: [
    // Optimize files for productions
    new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js"),

    // Ignore electron modules and other modules we don't want to compile in
    new webpack.IgnorePlugin(new RegExp("^(googleapis|electron)$")),

    // Copy our static assets
    new CopyWebpackPlugin([
      { from:'src/main/', to:'main', force:true },
      { from:'src/shared/', to:'shared', force:true },
      { from:'package.json', to:'', force:true },
      { from:'src/mailbox/mailbox.html', to:'mailbox.html', force:true },
    ], {
      ignore: [ '.DS_Store' ]
    })
  ],
  output: {
    path      : "./bin",
    filename  : "mailbox.js",
    publicPath: "./bin/"
  },
  resolve: {
    extensions: ["", ".js", ".jsx", ".less", ".css"],
    modulesDirectories: ["web_modules", "node_modules", __dirname, "src"]
  },
  module: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel',
        exclude: /node_modules/,
        include: __dirname,
        query: {
          cacheDirectory: true
        }
      },
      {
        test: /(\.less|\.css)$/,
        loaders: ['style', 'css', 'less']
      },
      /*{
        test: /\.(ttf|eot|svg|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader",
        query : {
          name : 'fonts/[name].[ext]?_=[hash]'
        }
      },
      {
        test: /images\/(.*)\.(png|jpg|jpeg)$/,
        loader: 'url-loader',
        query: {
          limit:8192,
          name : 'images/[name].[ext]?_=[hash]'
        }
      }*/
    ]
  }
}

options.target = webpackTargetElectronRenderer(options)
module.exports = options
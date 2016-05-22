function getArg (name, defaultValue) {
  const arg = process.argv.find((a) => a.indexOf(name) === 0)
  return arg === undefined ? defaultValue : arg
}

// Production
if (getArg('-p') !== undefined) {
  console.log('[PRODUCTION BUILD]')
  process.env.NODE_ENV = 'production'
} else {
  console.log('[DEVELOPMENT BUILD]')
}

// Cheap / expensive source maps
if (getArg('--fast') !== undefined) {
  console.log('[CHEAP SOURCEMAPS]')
  process.env.WEBPACK_DEVTOOL = 'eval-cheap-module-source-map'
} else {
  console.log('[FULL SOURCEMAPS]')
}

// Task export
const task = getArg('--task=', '--task=all').substr(7)
if (task === 'app') {
  console.log('[TASK=app]')
  module.exports = [
    require('./src/app/webpack.config.js')
  ]
} else if (task === 'mailboxes') {
  console.log('[TASK=mailboxes]')
  module.exports = [
    require('./src/scenes/mailboxes/webpack.config.js')
  ]
} else if (task === 'platform') {
  console.log('[TASK=platform]')
  module.exports = [
    require('./src/scenes/platform/webpack.config.js')
  ]
} else if (task === 'assets') {
  console.log('[TASK=assets]')
  module.exports = [
    require('./assets/webpack.config.js')
  ]
} else {
  console.log('[TASK=all]')
  module.exports = [
    require('./assets/webpack.config.js'),
    require('./src/app/webpack.config.js'),
    require('./src/scenes/mailboxes/webpack.config.js'),
    require('./src/scenes/platform/webpack.config.js')
  ]
}

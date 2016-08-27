const http = require('http')
const url = require('url')
const SpellcheckLoader = require('../../shared/SpellcheckManager')
const enUS = require('dictionary-en-us')
const Typo = require('typo-js')
const AppDirectory = require('appdirectory')
const pkg = require('../../package.json')
const {argv} = require('yargs')

const appDirectory = new AppDirectory(pkg.name).userData()
const port = parseInt(argv.port)
const language = argv.language === '_' ? undefined : argv.language
const loader = new SpellcheckLoader(appDirectory, enUS, Typo)

loader.loadEngine(language).then((dictionary) => {
  const server = http.createServer(function (request, response) {
    try {
      const queryData = url.parse(request.url, true).query
      if (request.url.indexOf('/check') === 0) {
        if (!queryData.word) {
          response.writeHead(400, {'Content-Type': 'application/json'})
          response.end(JSON.stringify({ error: 'Bad Request' }))
        } else {
          const correct = dictionary.check(queryData.word)
          response.writeHead(200, {'Content-Type': 'application/json'})
          response.end(JSON.stringify(correct))
        }
      } else if (request.url.indexOf('/suggest') === 0) {
        if (!queryData.word) {
          response.writeHead(400, {'Content-Type': 'application/json'})
          response.end(JSON.stringify({ error: 'Bad Request' }))
        } else {
          const suggestions = dictionary.suggest(queryData.word)
          response.writeHead(200, {'Content-Type': 'application/json'})
          response.end(JSON.stringify(suggestions))
        }
      } else {
        response.writeHead(404, {'Content-Type': 'application/json'})
        response.end(JSON.stringify({ error: 'Not Found' }))
      }
    } catch (ex) {
      response.writeHead(500, {'Content-Type': 'application/json'})
      response.end(JSON.stringify({ error: 'Server Error' }))
    }
  })

  server.listen(port)
})

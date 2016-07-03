const http = require('http')
const url = require('url')
const { SPELLCHECK_HTTP_PORT } = require('../../shared/constants')
const enUS = require('dictionary-en-us')
const Typo = require('typo-js')

enUS((err, load) => {
  if (err) { return }

  const dictionary = new Typo('en_US', load.aff.toString(), load.dic.toString())
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

  server.listen(SPELLCHECK_HTTP_PORT)
})

const express = require('express')
const debug = require('debug')('api:router')
const Prometheus = require('prom-client')
const bodyParser = require('body-parser')
const cors = require('cors')
const addRequestId = require('express-request-id')()
const URLSafeBase64 = require('urlsafe-base64')
const subHours = require('date-fns/sub_hours')
const request = require('request')

const app = express()

const routeGauge = new Prometheus.Gauge({
  name: 'routes',
  help: 'Matched routes by User',
  labelNames: ['path', 'user']
})

const config = {
  server: {
    port: 3000,
  },
  prometheus: {
    host: 'localhost',
    port: 9090
  }
}

const routeFilter = [
  '/metrics',
  '/api/v0/metrics/:user/requests'
]

// attach final handler for analytics
// for local development:
//   brew install prometheus && prometheus --config.file=./prometheus.yml --web.listen-address="0.0.0.0:9090"
app.use((req, res, next) => {
  // after a request is done, do some tail action
  req.once('end', () => {
    debug('Measured path:', req.path)
    // eject on maintenance routes, or any
    // other you do not wish to track
    if (!req.route || !req.route.path || routeFilter.includes(req.route.path)) return

    // let's track that lazily
    setImmediate(() => {
      routeGauge.labels(req.route.path, req.params.user).inc()
      debug('Measured prom metric for:', req.route.path)
    })
  })

  next()
})

app.set('json spaces', 2)
app.use(addRequestId)
app.use(cors())
app.options('*', cors())
app.use(bodyParser.json({ limit: '100kb' }))

app.get('/metrics', (req, res) => {
  res.set('Content-Type', Prometheus.register.contentType)
  res.end(Prometheus.register.metrics())
})

app.get('/api/v0/products/:user', (req, res, next) => {
  res.status(200).json({
    status: 200,
    msg: 'some test payload',
    request: {
      host: req.hostname,
      id: req.id,
    },
    data: [
      {
        name: 'A Product'
      }
    ]
  })
})

app.get('/api/v0/metrics/:user/requests', (req, res, next) => {
  const now = new Date()
  const diff = subHours(now, 24)

  const options = {
    method: 'GET',
    url: `http://${config.prometheus.host}:${config.prometheus.port}/api/v1/query_range`,
    qs: {
      query: URLSafeBase64.encode(`irate(routes{user='${req.params.user}'}[1m])`),
      start: diff.getTime() / 1000,
      end: now.getTime() / 1000,
      step: '14'
    },
    headers: { 'Cache-Control': 'no-cache' }
  }

  request(options, function (err, response, body) {
    if (err) return next(err)

    let data
    try {
      data = JSON.parse(body)
    } catch (err) {
      return next(err)
    }

    if (!data || !data.data || !data.data.result || !Array.isArray(data.data.result)) {
      return next(new Error('Unexpected data error.'))
    }

    res.status(201).json({
      status: 201,
      msg: 'Metrics retrieved.',
      request: {
        host: req.hostname,
        id: req.id,
      },
      data: data.data.result
    })
  })
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))

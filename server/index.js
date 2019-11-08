// require('babel-register');
require('babel-polyfill')

const Koa = require('koa')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const {resolve} = require('path')

import * as R from 'ramda'

const app = new Koa()
const r = path => resolve(__dirname, path)

let config = require('../nuxt.config.js')
config.dev = !(app.env === 'production')

const MIDDLEWARES = ['database', 'common', 'router'];

function userMiddlewares(app) {

  return R.map(R.compose(
      R.map(i => i(app)),
      require,
      i => `${r('./middlewares')}/${i}`
    ));
}

async function start() {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)

  const {
    host = process.env.HOST || '127.0.0.1',
    port = process.env.PORT || 3000
  } = nuxt.options.server

  await userMiddlewares(app)(MIDDLEWARES)

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  app.use(ctx => {
    ctx.status = 200
    ctx.respond = false // Bypass Koa's built-in response handling
    ctx.req.ctx = ctx // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
    nuxt.render(ctx.req, ctx.res)
  })

  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}

start()

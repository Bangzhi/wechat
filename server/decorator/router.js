import glob from 'glob'
import {resolve} from 'path'
import Router from 'koa-router' 
import _ from 'lodash'
import R from 'ramda'

export const symbolPrefix = Symbol('prefix')
export const routersMap = new Map()

export const isArray = o => _.isArray(o) ? o : [o]
export const normalizePath = path => path.startsWith('/') ? path : `/${path}`

export  class Route {
  constructor(app, apiPath) {
    this.app = app
    this.apiPath = apiPath
    this.router = new Router()
  }
  init() {
    glob.sync(resolve(this.apiPath, './*.js')).forEach(require)

    for (let [conf, controller] of routersMap) {
      const controllers = isArray(controller)
      let prefixPath = conf.target[symbolPrefix]
      if (prefixPath) prefixPath = normalizePath(prefixPath)
      const routerPath = prefixPath + conf.path 
      
      this.router[conf.method](routerPath, ...controllers)
    }

    this.app
            .use(this.router.routes())
            .use(this.router.allowedMethods())
  }
}

export const router = conf => (target, key, descriptor) => {
  conf.path = normalizePath(conf.path)

  routersMap.set({
    target: target,
    ...conf
  }, target[key])
}

export const controller = path => target => target.prototype[symbolPrefix] = path

export const get = path => router({
  path: path,
  method: 'get',
})

export const post = path => router({
  path: path,
  method: 'post',
})

export const decrator = (args, middleware) => {
  const [target, key, descriptor] = args
  target[key] = isArray(target[key])
  target[key].unshift(middleware)

  return descriptor
}

export const convert = middleware => (...args) => decrator(args, middleware)

export const required = rules => convert(async function(ctx, next) {
  
  let errors = []

  const parseRules = R.forEachObjIndexed((value, key) => {
    
    errors = R.filter(i => {!R.has(i, ctx.request[key])})(value)
  })

  parseRules(rules)

  if (errors.length) ctx.throw(412, `${errors.join(', ')} 参数缺失`)

  await next()
})  



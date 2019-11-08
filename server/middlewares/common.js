import bodyParser from 'koa-bodyparser'
import koaSession from 'koa-session'

export const addKoaBodyParser = app => {
  app.use(bodyParser())
}

export const addSession = app => {
  app.keys = ['bangzhi'];
 
  const CONFIG = {
    key: 'koa:sess',
    maxAge: 86400000,
    autoCommit: true, 
    overwrite: true, 
    httpOnly: true,
    signed: true,
    rolling: false, 
    renew: false,
  }

  app.use(koaSession(CONFIG, app))
}
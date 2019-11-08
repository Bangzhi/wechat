
import config from '../config'
import reply from '../wechat/reply'
import wechatMiddle from '../wechat-lib/middleware'
import {signature, redirect, oauth} from '../controllers/wechat'
import {controller, get, post} from '../decorator/router'

// export const router = (app) => {

//   const router = new Router()

//   router.all('/wechat-hear', wechatMiddle(config.wechat, reply))
//   router.get('/wechat-signature', signature)
//   router.get('/wechat-redirect', redirect)
//   router.get('/wechat-oauth', oauth) 

//   app
//     .use(router.routes())
//     .use(router.allowedMethods())
// }
@controller('')
export class WxController {
  //监听微信推送 和 验证微信服务器
  @get('/wechat-hear') 
  async wxHear(ctx, next) {
    const middle = wechatMiddle(config.wechat, reply)

    const body = await middle(ctx, next)

    ctx.body = body
  }

  @post('/wechat-hear')
  async wxHear(ctx, next) {
    const middle = wechatMiddle(config.wechat, reply)
    const body = await middle(ctx, next)

    ctx.body = body
  }

  @get('/wechat-signature')
  async wxSignature(ctx, next) {
    await signature(ctx, next)
  }

  @get('/wechat-redirect')
  async wxRedirect(ctx, next) {
    await redirect(ctx, next)
  }

  @get('/wechat-oauth')
  async wxOauth(ctx, next) {
    await oauth(ctx, next)
  }
}
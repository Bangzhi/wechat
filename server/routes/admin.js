import {controller, get, post, required} from '../decorator/router'
import * as admin from '../controllers/admin'

@controller('/admin')
export class adminController{
  @post('/login')
  @required({body: ['mobile', 'passpord']})
  async login(ctx, next) {
    await admin.login(ctx, next)
  }

  @post('/logout')
  @required({body: ['mobile']})
  async logout(ctx, next) {
    await admin.logout(ctx, next)
  }

  @post('/register')
  async register(ctx, next) {
    await admin.register(ctx, next)
  }
}
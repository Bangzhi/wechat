import * as api from '../api'

export async function login(ctx, next) {
  const {mobile, password} = ctx.request.body

  let user = await api.login(mobile, password)
  
  if (user && user.isMatch) {
    ctx.session.userInfo = user

    ctx.body = {
      status: 200,
      msg: '登录成功',
      data: {
        mobile: user.mobile
      }
    }

  } else {

    ctx.body = {
      status: 201,
      msg: '登录失败',
    }
  }
}

export async function logout(ctx, next) {
  ctx.session = null

  ctx.body = {
    status: 200,
    msg: '退出登录成功'
  }
}
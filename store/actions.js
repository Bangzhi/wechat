
import Services from './services'
import services from './services'
export default {
  async nuxtServerInit({commit}, {req}) {

    if (req.ctx.session && req.ctx.session.userInfo) {
      commit('SET_USERINFO', req.ctx.session.userInfo)
    }
  },
  getWechatSignature({commit}, url) {
    return Services.getWechatSignature(url)
  },
  getUserInfoByOAuth({commit}, url) {
    return Services.getUserInfoByOAuth(url)
  },
  adminLogin({commit}, loginData) {
    return Services.adminLogin(loginData)
  },
  adminLogout({commit, state}, logoutData) {
    Services.adminLogout(logoutData).then(() => {
      commit('SET_USERINFO', null)
      console.log(state)
    })
  }
}
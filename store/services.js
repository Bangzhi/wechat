import axios from 'axios'
const baseUrl = ''
class Services {
  getWechatSignature(url) {

    return axios.get(`${baseUrl}/wechat-signature?url=${url}`)
  }
  getUserInfoByOAuth(url) {

    return axios.get(`${baseUrl}/wechat-oauth?url=${url}`)
  }
  //后台登录接口
  adminLogin({mobile, password}) {
    return axios.post(`${baseUrl}/admin/login`, {
      mobile: mobile,
      password: password,
    })
  }
  //后台退出登录
  adminLogout({mobile}) {
    return axios.post(`${baseUrl}/admin/logout`, {
      mobile: mobile,
    })
  }
}

export default new Services()
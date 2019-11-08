import {getWechat, getOAuth } from '../wechat'
const  client = getWechat()
//获取签名 签名需要参数 noncestr(随机字符串)、jsapi_ticket、 timestamp(时间戳)、当前网页的URL 不包含#及其后面的部分
export async function getSignatureAsync(url) {
  //获取全局票据
  const data = await client.fetchAccessToken()
  const token = data.access_token
  //获取jsapi_ticket
  const ticketData = await client.fetchTicket(token)
  const ticket = ticketData.ticket
  //获取签名
  let params = client.sign(ticket, url)
  params.appId = client.appID

  return params    
}

export function getAuthorizeURL(...args) {
  const oauth  = getOAuth()

  return oauth.getAuthorizeURL(...args)
}

export async function getUserInfoByCode(code) {
  const oauth = getOAuth()
  const data = await oauth.fetchAccessToken(code)
  const user = await oauth.getUserInfo(data.access_token, data.openid)

  return user
}
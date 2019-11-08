import request from 'request-promise'
import fs from 'fs'
import * as _ from 'lodash'
import { sign } from './util'

const base = 'https://api.weixin.qq.com/cgi-bin/'
const api = {
  accessToken: base + 'token?grant_type=client_credential',
  temporary: {
    //上传临时素材
    upload: base + 'media/upload?',
    //获取临时素材
    fetch: base + 'media/get?'
  },
  permanent: {
    //上传其他永久素材
    upload: base + 'material/add_material?',
    //上传永久图文素材
    uploadNews: base + 'material/add_news?',
    //上传图文消息内的图片获取URL
    uploadNewsPic: base + 'media/uploadimg?',
    //获取其他永久素材
    fetch: base + 'material/get_material?',
    //删除永久素材
    del: base + 'material/del_material?',
    //更新永久图文素材
    update: base + 'material/update_news?',
    count: base + 'material/get_materialcount?',
    batch: base + 'material/batchget_material?'
  },
  tag: {
    create: base + 'tags/create?',
    fetch: base + 'tags/get?',
    update: base + 'tags/update?',
    del: base + 'tags/delete?',
    fetchUsers: base + 'user/tag/get?',
    batchTag: base + 'tags/members/batchtagging?',
    batchUnTag: base + 'tags/members/batchuntagging?',
    getTagList: base + 'tags/getidlist?'
  },
  user: {
    remark: base + 'user/info/updateremark?',
    info: base + 'user/info?',
    batchInfo: base + 'user/info/batchget?',
    fetchUserList: base + 'user/get?',
    getBlackList: base + 'tags/members/getblacklist?',
    batchBlackUsers: base + 'tags/members/batchblacklist?',
    batchUnblackUsers: base + 'tags/members/batchunblacklist?'
  },
  menu: {
    create: base + 'menu/create?',
    get: base + 'menu/get?',
    del: base + 'menu/delete?',
    addCondition: base + 'menu/addconditional?',
    delCondition: base + 'menu/delconditional?',
    getInfo: base + 'get_current_selfmenu_info?'
  },
  ticket: {
    get: base + 'ticket/getticket?'
  }
}

class Wechat {
  constructor(opts) {
    this.opts = Object.assign({}, opts)

    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    this.getTicket = opts.getTicket
    this.saveTicket = opts.saveTicket

    this.fetchAccessToken()
  }

  async request(options) {
    options = Object.assign({}, options, { json: true })

    try {
      const response = await request(options)

      return response
    } catch (error) {
      console.error(error)
    }
  }

  async fetchAccessToken() {
    let data = await this.getAccessToken()
    
    if (!this.isValidToken(data, 'access_token')) {
      data = await this.updateAccessToken()

    }

    await this.saveAccessToken(data)

    return data
  }
  async updateAccessToken() {
    const url = api.accessToken + '&appid=' + this.appID + '&secret=' + this.appSecret
    const data = await this.request({ url: url })
    const now = (new Date().getTime())
    const expiresIn = now + (data.expires_in - 20) * 1000

    data.expires_in = expiresIn

    return data
  }
  //获取票据
  async fetchTicket(token) {
    let data = await this.getTicket()

    if (!this.isValidToken(data, 'ticket')) {
      data = await this.updateTicket(token)

    }

    await this.saveTicket(data)

    return data
  }
  //更新票据
  async updateTicket(token) {
    const url = api.ticket.get + 'access_token=' + token + '&type=jsapi'
    const data = await this.request({ url: url })
    const now = (new Date().getTime())
    const expiresIn = now + (data.expires_in - 20) * 1000

    data.expires_in = expiresIn

    return data
  }
  isValidToken(data, name) {
    
    if (!data || !data[name] || !data.expires_in) {
      return false
    }

    const expiresIn = data.expires_in
    const now = (new Date().getTime())

    if (now < expiresIn) {
      return true
    } else {
      return false
    }
  }
  //上传临时素材
  async upload(operation, ...args) {
    const tokenData = await this.fetchAccessToken()
    const options = this[operation](tokenData.access_token, ...args)
    const data = await this.request(options)

    return data
  }
  //构建上传素材表单
  uploadMaterial(token, type, material, permanent) {
    let form = {}
    let url = api.temporary.upload
  
    //永久素材需要的参数 （上传素材需要另一个表单 id为description）
    if (permanent) {
      url = api.permanent.upload

      _.extend(form, permanent)
    }
    //图文消息图片 永久素材 不需要传官方指定type值 自定义一个pic
    if (type === 'pic') {
      url = api.permanent.uploadNewsPic
    }
    //图文消息 永久素材 不需要传官方指定type值 自定义一个news
    if (type === 'news') {
      url = api.permanent.uploadNews
      form = material
    } else {
      form.media = fs.createReadStream(material)
    }
    
    let uploadUrl = url + 'access_token=' + token

    if (!permanent) {
      uploadUrl += '&type=' + type
    } else {
      if (type !== 'news') {
        form.access_token = token
      }
    }

    const options = {
      method: 'POST',
      url: uploadUrl,
      json: true
    }

    if (type === 'news') {
      options.body = form
    } else {
      options.formData = form
    }

    return options
  }
  //获取素材
  fetchMaterial(token, mediaId, type, permanent) {
    let form = {}
    let fetchUrl = api.temporary.fetch

    if (permanent) {
      fetchUrl = api.permanent.fetch
    }

    let url = fetchUrl + 'access_token=' + token
    let options = {
      method: 'POST',
      url: url,
    }

    if (permanent) {
      form.media_id = mediaId
      form.access_token = token
      options.body = form
    } else {
      if (type === 'video') {
        url = url.replace('https://', 'http://')
      }

      url += '&media_id=' + mediaId
    }

    return options
  }
  //删除素材
  delMaterial(token, mediaId) {
    const form = {
      media_id: mediaId
    }
    const url = api.permanent.del + 'access_token=' + token + '&media_id' + mediaId

    let options = {
      method: 'POST',
      url: url,
      body: form
    }

    return options
  }
  //更新素材
  updateMaterial(token, mediaId, news) {
    const form = {
      media_id: mediaId
    }

    _.extend(form, news)
    const url = api.permanent.update + 'access_token=' + token + '&media_id=' + mediaId

    return {method: 'POST', url: url, body: form}
  }
  //素材总数
  countMaterial(token) {
    const url = api.permanent.count + 'access_token=' + token

    return {method: 'GET', url: url}
  }
  //获取素材列表
  batchMaterial(token, options) {
    options.type = options.type || 'image'
    options.offset = options.offset || 0
    options.count = options.count || 10

    const url = api.permanent.batch + 'access_token=' + token

    return {method: 'POST',url: url,body: options}
  }
  //创建标签
  createTag(token, name) {
    const form = {
      tag: {
        name: name
      }
    }

    const url = api.tag.create + 'access_token=' + token
    
    return {method: 'POST', url: url, body: form}
  }
  //获取已创建的标签
  fetchTag(token) {
    const url = api.tag.fetch + 'access_token=' + token

    return {url: url}
  }
  //编辑标签
  updateTag(token, tagId, name) {
    const form = {
      tag: {
        id: tagId,
        name: name
      }
    }

    const url = api.tag.update + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }
  //删除标签
  delTag (token, tagId) {
    const form = {
      tag: {
        id: tagId
      }
    }

    const url = api.tag.del + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }
  //获取标签下粉丝列表
  fetchTagUsers (token, tagId, openId) {
    const form = {
      tagid: tagId,
      next_openid: openId || ''
    }
    const url = api.tag.fetchUsers + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }
  //批量为用户打标签
  // unTag true|false
  batchTag (token, openIdList, tagId, unTag) {
    const form = {
      openid_list: openIdList,
      tagid: tagId
    }
    let url = api.tag.batchTag

    if (unTag) {
      url = api.tag.batchUnTag
    }

    url += 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }
  //获取用户身上的标签列表
  getTagList (token, openId) {
    const form = {
      openid: openId
    }
    const url = api.tag.getTagList + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }
  //设置用户备注
  remarkUser(token, openId, remark) {
    const form = {
      openid: openId,
      remark: remark
    }
    const url = api.user.remark + 'access_token=' + token

    return {method: 'POST', url: url, body: form}
  }
  //获取用户基本信息
  getUserInfo (token, openId, lang) {
    const url = `${api.user.info}access_token=${token}&openid=${openId}&lang=${lang || 'zh_CN'}`

    return {url: url}
  }
  //批量获取用户信息
  batchUserInfo (token, userList) {
    const url = api.user.batchInfo + 'access_token=' + token
    const form = {
      user_list: userList
    }

    return {method: 'POST', url: url, body: form}
  }
  //获取用户列表
  fetchUserList (token, openId) {
    const url = `${api.user.fetchUserList}access_token=${token}&next_openid=${openId || ''}`

    return {url: url}
  }
  //创建菜单
  createMenu(token, menu) {
    let url = api.menu.create + 'access_token=' + token
    
    return {method: 'POST', url: url, body: menu}
  }
  //获取菜单
  getMenu(token) {
    let url = api.menu.get + 'access_token=' + token
    
    return {url: url}
  }
  //删除菜单
  delMenu(token) {
    let url = api.menu.del + 'access_token=' + token
    
    return {url: url}
  }
  //创建个性化菜单
  addConditionMenu(token, meun, rule) {
    const url = api.menu.addCondition + 'access_token=' + token
    const form = {
      button: menu,
      matchrule: rule
    }

    return {method: 'POST', url: url, body: form}
  }
  delConditionMenu (token, menuId) {
    const url = api.menu.delCondition + 'access_token=' + token
    const form = {
      menuid: menuId
    }

    return {method: 'POST', url: url, body: form}
  }
  getCurrentMenuInfo (token) {
    const url = api.menu.getInfo + 'access_token=' + token

    return {url: url}
  }
  sign(ticket, url) {

    return sign(ticket, url)
  }
}

export default Wechat




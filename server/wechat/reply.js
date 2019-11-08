const tip = "成功成功"

export default async (ctx, next) => {
	const message = ctx.weixin
	console.log(message)
	ctx.body = tip

	if (message.MsgType === 'event') {
		//关注 
		if (message.Event === 'subscribe') {
			ctx.body = tip
		//取消关注
		} else if (message.Event === 'unsubscribe') {
			console.log('取消关注了')
			//上报地理位置
		} else if (message.Event === 'LOCATION') {
			ctx.body = message.Latitude + ' : ' + message.Longitude
		} else if (message.Event === 'CLICK') {
			ctx.body = message.EventKey
		} else if (message.Event === 'pic_sysphoto') {
			ctx.body = ctx.body = message.Count + ' photos sent'
		}
		//消息类型文字
	} else if (message.MsgType === 'text') {
		if (message.Content === '1') {
			let mp = require('../wechat')
			let wechatClient = mp.getWechat()
		
			// let data = await wechatClient.upload('fetchTag')
			// let data = await wechatClient.upload('createTag', '北京')
			// let data = await wechatClient.upload('delTag', 100)
			// let data = await wechatClient.upload('fetchUserList')
			let data = await wechatClient.upload('getUserInfo', 'oBGg-1HmTIY7-aSQHJUzVg02rukw')

			console.log(data)
		}

		if (message.Content === '2') {
			let mp = require('../wechat')
			let wechatClient = mp.getWechat()
			let menu = require('./menu').default
			await wechatClient.upload('delMenu')
			let data = await wechatClient.upload('createMenu', menu)
			// let data = await wechatClient.upload('getMenu')

			console.log(JSON.stringify(data))
		}
		ctx.body = message.Content
		//图片类型
	} else if (message.MsgType === 'image') {
		ctx.body = {
      type: 'image',
      mediaId: message.MediaId
		}
		//语音消息
	} else if (message.MsgType === 'voice') {
		ctx.body = {
			type: 'voice',
      mediaId: message.MediaId
		}
		//视频消息
	} else if (message.MsgType === 'video') {
		ctx.body = {
			type: 'video',
			mediaId: message.MediaId,
		}
		//位置
	} else if (message.MsgType === 'location') {
		ctx.body = message.Location_X + ' : ' + message.Location_Y + ' : ' + message.Label
		//链接
	} else if (message.MsgType === 'link') {
		ctx.body = [{
			title: message.Titile,
			description: message.Description,
			picUrl: 'http://mmbiz.qpic.cn/mmbiz_jpg/xAyPZaQZmH09wYBjskFEQSoM4te0SnXR9YgbJxlDPVPDZtgLCW5FacWUlxFiaZ7d8vgGY6mzmF9aRibn05VvdtTw/0',
			url: message.Url
		}]
	}
}
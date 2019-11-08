<template>
  <section class="container">
    <div>
      <logo />
      <h1 class="title">
        ice
      </h1>
      <h2 class="subtitle">
        登录成功
      </h2>
      <el-button type="primary">成功引入element-ui</el-button>
      <el-button type="primary" @click="logout">退出登录</el-button>
    </div>
  </section>
</template>

<script>
import Logo from '~/components/Logo.vue'
import {mapState} from 'vuex'
export default {
  middleware: 'auth',
  components: {
    Logo
  },
  head() {
    return {
      title: '测试页面'
    }
  },
  computed: {
    ...mapState(['userInfo'])
  },
  methods: {
    async logout() {
      console.log()
      await this.$store.dispatch('adminLogout', {mobile: this.userInfo.mobile})
      this.$router.push('/admin/login')
    }
  },
  beforeMount () {
    const wx = window.wx
    const url = window.location.href
    
    this.$store.dispatch('getWechatSignature', url)
    .then((res) => {
      if (res.data.success) {
        const params = res.data.params
        wx.config({
          debug: false,
          appId: params.appId,
          timestamp: params.timestamp,
          nonceStr: params.noncestr,
          signature: params.signature,
          jsApiList: [
            'hideAllNonBaseMenuItem',
            'chooseImage',
            'previewImage',
            'uploadImage',
            'showMenuItems']
        })

        wx.ready(() => {
          wx.hideAllNonBaseMenuItem()
          console.log('success')
        })
      }
    })
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>

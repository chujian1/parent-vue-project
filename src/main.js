import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { registerApplication, start } from 'single-spa'
// 在父应用中注册子应用，然后匹配到路由时加载子应用 cnpm i single-spa

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

async function loadScript(url) {
  // js加载是异步的,所以写一个promise
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

registerApplication('childVue', // 自定义加载的应用名称
  async () => {
    // 父应用加载子应用即就是加载子应用打包之后的两个脚本 chunk-vendors.js 和 app.js
    // 加载方案很多，single-spa推荐systemJS方案,它是一个模块化规范，可以在浏览器中引用es6模块
    // 动态创建一个script标签将模块引入
    await loadScript(`http://localhost:10000/js/chunk-vendors.js`) // 必须先加载这个
    await loadScript('http://localhost:10000/js/app.js') 
    // 必须返回bootstrap mount unmount 这三个方法
    return window.childVue
  }, // 必须是一个promise
  location => location.pathname.startsWith('/vue'), // 执行上个方法触发的条件，当路径为/vue的时候，加载子应用
)
start()

// single-spa 缺陷
// 1.不够灵活 需要手动加载js
// 2. 做不到css隔离，没有js沙箱机制
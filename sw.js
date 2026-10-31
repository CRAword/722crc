/* 临研小站离线壳（构建产物，由 vite.config.js 生成）
 *   CACHE    → 本次产物的内容指纹，换一次构建就换一个缓存名，老缓存 activate 时自动清
 *   PRECACHE → 产物里所有可缓存文件的相对 URL 清单
 * dev 下不注册（App.vue 里挡了）。
 */
const CACHE = 'linyan-h5-0f21144452'

const PRECACHE = ["./assets/about-RhLdDLtK.css", "./assets/app-192-BkbaTNhI.png", "./assets/apple-touch-icon-DCWqwBL-.png", "./assets/data-BoXmeDdh.css", "./assets/index-BPAVtdqR.css", "./assets/index-dGzUJ2H2.js", "./assets/log-DtxoH9Ob.css", "./assets/mine-D4xTPvtq.css", "./assets/pages-about-about.j3p32GS3.js", "./assets/pages-data-data.C0AcENsp.js", "./assets/pages-log-log.Dz6Jn9Rk.js", "./assets/pages-mine-mine.Bydu_hdF.js", "./assets/pages-pro-pro.Dv_1wpnk.js", "./assets/pages-project-detail-project-detail.Kj8n30vT.js", "./assets/pages-project-project.B6qQTefI.js", "./assets/pages-project-settings-project-settings.C-_wc3N-.js", "./assets/pages-subject-detail-subject-detail.CnQdWCPC.js", "./assets/pages-todo-todo.BWL5urds.js", "./assets/pro-B-8heDBy.css", "./assets/project-BL-TfKJ9.css", "./assets/project-detail-C5Sap-qU.css", "./assets/project-settings-BA0HdFkV.css", "./assets/pwa-manifest-Dr3RviWU.json", "./assets/reward-code-BGZYHX6-.png", "./assets/subject-detail-D8exeoGt.css", "./assets/subject-form.D4ed3Muk.js", "./assets/todo-B5_xCPdu.css", "./assets/uni-app.es.DapA9xOe.js", "./assets/uni.f8dfcabe.css", "./assets/visit-sheet-BelDNSGL.css", "./assets/visit-sheet.Bju6O9uh.js", "./assets/_plugin-vue_export-helper.BCo6x5W8.js", "./index.html", "./static/icons/app-192.png", "./static/icons/app-512.png", "./static/icons/app-maskable-512.png", "./static/icons/apple-touch-icon.png", "./static/icons/brand-mark.png", "./static/icons/dev-mark-dark.png", "./static/icons/dev-mark.png", "./static/images/reward-code.png", "./static/pwa-manifest.json", "./static/tabbar/log-dark.png", "./static/tabbar/log-on-dark.png", "./static/tabbar/log-on.png", "./static/tabbar/log.png", "./static/tabbar/mine-dark.png", "./static/tabbar/mine-on-dark.png", "./static/tabbar/mine-on.png", "./static/tabbar/mine.png", "./static/tabbar/project-dark.png", "./static/tabbar/project-on-dark.png", "./static/tabbar/project-on.png", "./static/tabbar/project.png", "./static/tabbar/todo-dark.png", "./static/tabbar/todo-on-dark.png", "./static/tabbar/todo-on.png", "./static/tabbar/todo.png"]

self.addEventListener('install', (event) => {
  // 逐个 add 而不是 addAll：addAll 只要有一个 404 就整体 reject，
  // 那等于整个离线壳废掉，且只在控制台留一行看不见的报错
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  if (req.mode === 'navigate') {
    event.respondWith(navigate(req))
    return
  }

  // 静态资源：文件名带 hash，命中就秒回，没命中回源并写入
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          save(req, res)
          return res
        })
    )
  )
})

// 首页：在线尽量拿最新版（改版能跟上），但最多等 1.2 秒，
// 慢网直接上缓存的壳，别让人对着白屏转圈
async function navigate(req) {
  // 系统明确报断网就不给网络留窗口。实测：不短路的话 localhost 连不上要等满 1.2 秒，
  // 「秒开」正好卡在这上面；onLine 误报（有 wifi 但出不去）还有下面的超时兜着
  if (!self.navigator.onLine) return shell(req)

  let fresh = null
  const net = fetch(req)
    .then((res) => {
      if (res.ok) {
        save(req, res)
        fresh = res
      }
    })
    .catch(() => {})
  await Promise.race([net, new Promise((r) => setTimeout(r, 1200))])
  return fresh || (await shell(req))
}

function shell(req) {
  return caches
    .match(req)
    .then((hit) => hit || caches.match('./index.html'))
}

function save(req, res) {
  if (!res || !res.ok) return
  const copy = res.clone()
  caches.open(CACHE).then((cache) => cache.put(req, copy))
}

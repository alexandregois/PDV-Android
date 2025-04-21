import { APP_TITLE } from '@/utils/constants'
import Vue from 'vue'
import VueRouter from 'vue-router'
import unauth from './unauth'
import auth from './auth'

Vue.use(VueRouter)

const routes = [
  ...unauth,
  ...auth
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  const title = to.meta.title ? `${to.meta.title} | ` : ''
  document.title = `${title}${APP_TITLE}`
  next()
})

export default router

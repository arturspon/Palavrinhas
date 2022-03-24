import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GameView from '../views/GameView.vue'
import SingleplayerGameView from '../views/SingleplayerGameView.vue'
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue'
import UserStatsView from '../views/UserStatsView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/game/:gameId',
    name: 'game',
    component: GameView
  },
  {
    path: '/sp-game',
    name: 'sp-game',
    component: SingleplayerGameView
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: PrivacyPolicyView
  },
  {
    path: '/stats',
    name: 'stats',
    component: UserStatsView
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

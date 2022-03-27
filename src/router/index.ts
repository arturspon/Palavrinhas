import HomeView from '../pages/HomeView.vue'
import GameView from '../pages/GameView.vue'
import SingleplayerGameView from '../pages/SingleplayerGameView.vue'
import PrivacyPolicyView from '../pages/PrivacyPolicyView.vue'
import UserStatsView from '../pages/UserStatsView.vue'

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
    component: () => import(/* webpackChunkName: "about" */ '../pages/AboutView.vue')
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

export default routes

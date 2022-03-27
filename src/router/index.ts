import HomeView from '../pages/HomeView.vue'
import GameView from '../pages/GameView.vue'
import SingleplayerGameView from '../pages/SingleplayerGameView.vue'
import PrivacyPolicyView from '../pages/PrivacyPolicyView.vue'
import UserStatsView from '../pages/UserStatsView.vue'
import MatchRedirectView from '../pages/MatchRedirectView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      enterClass: 'animate__animated animate__fadeInLeft',
      leaveClass: 'animate__animated animate__fadeOutRight',
    },
  },
  {
    path: '/game/:gameId',
    name: 'game',
    component: GameView,
    meta: {
      enterClass: 'animate__animated animate__fadeInRight',
      leaveClass: 'animate__animated animate__fadeOutLeft',
    },
  },
  {
    path: '/sp-game',
    name: 'sp-game',
    component: SingleplayerGameView,
    meta: {
      enterClass: 'animate__animated animate__fadeInRight',
      leaveClass: 'animate__animated animate__fadeOutLeft',
    },
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: PrivacyPolicyView,
    meta: {
      enterClass: 'animate__animated animate__fadeInRight',
      leaveClass: 'animate__animated animate__fadeOutLeft',
    },
  },
  {
    path: '/stats',
    name: 'stats',
    component: UserStatsView,
    meta: {
      enterClass: 'animate__animated animate__fadeInRight',
      leaveClass: 'animate__animated animate__fadeOutLeft',
    },
  },
  {
    path: '/match-redirect/:newMatchId',
    name: 'mathRedirect',
    component: MatchRedirectView,
    meta: {
      enterClass: 'animate__animated animate__fadeInRight',
      leaveClass: 'animate__animated animate__fadeOutLeft',
    },
  },
]

export default routes

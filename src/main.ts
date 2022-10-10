import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './router/index'

import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import '@/assets/css/bootstrap.min.css'
import '@/assets/js/bootstrap.bundle.min.js'
import '@/assets/css/custom.css'
import 'animate.css'

import ScriptX from 'vue-scriptx'
import Ads from 'vue-google-adsense'

const firebaseConfig = {
  apiKey: 'AIzaSyB73Yi9YXhAd1xdtgqXsIuQNtLsWF2jCNo',
  authDomain: 'palavreando-ac44f.firebaseapp.com',
  projectId: 'palavreando-ac44f',
  storageBucket: 'palavreando-ac44f.appspot.com',
  messagingSenderId: '851754266241',
  appId: '1:851754266241:web:58217b07a63363a71de780',
  measurementId: 'G-4N5FBCKKH9',
}

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)

const firebase = initializeApp(firebaseConfig)
app.config.globalProperties.$firebase = firebase
app.config.globalProperties.$analytics = getAnalytics(firebase)
app.config.globalProperties.$db = getFirestore()

app.use(createPinia())
app.use(router)
app.use(VueSweetalert2)

app.use(ScriptX)
app.use(Ads.AutoAdsense, { adClient: 'ca-pub-9517344625390117', isNewAdsCode: true })

app.mount('#app')

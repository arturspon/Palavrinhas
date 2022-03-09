import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: 'AIzaSyB73Yi9YXhAd1xdtgqXsIuQNtLsWF2jCNo',
  authDomain: 'palavreando-ac44f.firebaseapp.com',
  projectId: 'palavreando-ac44f',
  storageBucket: 'palavreando-ac44f.appspot.com',
  messagingSenderId: '851754266241',
  appId: '1:851754266241:web:58217b07a63363a71de780',
  measurementId: 'G-4N5FBCKKH9'
}

Vue.prototype.$firebase = initializeApp(firebaseConfig)
Vue.prototype.$analytics = getAnalytics(Vue.prototype.$firebase)
Vue.prototype.$db = getFirestore()

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

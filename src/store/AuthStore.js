import { defineStore } from 'pinia'
import { getFirestore } from 'firebase/firestore'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import {
  setDoc,
  getDoc,
  Timestamp,
  doc,
} from 'firebase/firestore'

export const useAuthStore = defineStore('authStore', {
  state: () => {
    return {
      db: getFirestore(),
      auth: getAuth(),
      user: null,
      userData: null,
    }
  },

  actions: {
    async signInAnon() {
      signInAnonymously(this.auth)
        .then(() => {
          // console.log('user signedIn')
        })
        .catch((error) => {
          const errorCode = error.code
          const errorMessage = error.message
          // ...
        })
    },

    attachAuthStateChangeListener() {
      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          // const uid = user.uid
          console.log(user.uid)
          this.user = user

          const userDoc = await this.getUserFirebaseDoc(user.uid)
          console.log(userDoc.exists())
          if (userDoc.exists()) {
            this.userData = userDoc.data()
          } else {
            this.createFirebaseUserDoc(user)
          }
        } else {
          // console.log('User is signed out')
          this.user = null
          this.signInAnon()
        }
      })
    },

    async getUserFirebaseDoc(userId) {
      const userDocRef = doc(this.db, 'users', userId)
      return await getDoc(userDocRef)
    },

    async createFirebaseUserDoc(user) {
      const oldHostId = localStorage.getItem('hostId')

      const userData = {
        stats: {
          matchesCount: 0,
          winsCount: 0,
          lossesCount: 0,
        },
        createdAt: Timestamp.now()
      }

      if (oldHostId) {
        userData.oldHostId = oldHostId
      }

      const userDocRef = doc(this.db, 'users', user.uid)
      await setDoc(userDocRef, userData)

      this.userData = userData
    },
  },
})

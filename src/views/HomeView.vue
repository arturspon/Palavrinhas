<template>
  <div class="home vh-100 d-flex align-items-center justify-content-center">
    <div>
      <h1>Palavreando</h1>
      <div class="mt-3">
        <button
          class="btn btn-primary btn-lg"
          :disabled="isLoading.gameCreation"
          @click="play()"
        >
          <template v-if="isLoading.gameCreation">
            <span
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span class="visually-hidden">Loading...</span>
          </template>
          <template v-else>JOGAR</template>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import getWords from '@/utils/words'

export default {
  name: 'HomeView',

  data() {
    return {
      isLoading: {
        gameCreation: false,
      },
    }
  },

  methods: {
    async play() {
      this.isLoading.gameCreation = true

      const hostId = this.uuidv4()
      localStorage.setItem('hostId', hostId)

      const gameData = {
        word: this.getRandomWord(),
        host: {
          id: hostId,
          guesses: [],
        },
        enemy: {
          id: null,
          guesses: [],
        },
        winner: null,
        started_at: null,
        ended_at: null,
        created_at: Timestamp.now()
      }

      const matchesCollection = collection(this.$db, 'matches')
      const docRef = await addDoc(matchesCollection, gameData)

      this.$router.push({
        name: 'game',
        params: {
          gameId: docRef.id,
        }
      })
    },

    getRandomWord() {
      const words = getWords()
      const min = 0
      const max = Math.floor(words.length)
      const wordIndex = Math.floor(Math.random() * (max - min + 1)) + min
      return words[wordIndex]
    },

    uuidv4() {
      return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    }
  },
}
</script>

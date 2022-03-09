<template>
  <div>
    <h1>Palavreando</h1>

    <div
      v-if="isLoading.match"
      class="spinner-border"
      style="width: 3rem; height: 3rem"
      role="status"
    >
      <span class="visually-hidden">Carregando...</span>
    </div>

    <div v-else-if="error" class="alert alert-warning">
      {{ error }}
      <div class="mt-2">
        <router-link :to="{ name: 'home' }" class="btn btn-primary">
          Ir para página inicial
        </router-link>
      </div>
    </div>

    <div
      v-if="match && match.winner"
      class="alert"
      :class="[isLocalPlayerWinner() ? 'alert-success' : 'alert-info']"
    >
      <p><b>Partida finalizado!</b></p>
      <p v-if="isLocalPlayerWinner()">
        😎
        <br />
        Parabéns, você ganhou!
      </p>
      <p v-else>Você perdeu, mas lembre-se, sempre há a próxima partida 😉</p>

      <div class="mt-2">
        <router-link :to="{ name: 'home' }" class="btn btn-primary">
          Jogar outra partida
        </router-link>
      </div>
    </div>

    <div v-else>
      <div class="mt-2">
        <a :href="getShareLink()" target="_blank">
          Compartilhar link via WhatsApp
        </a>
      </div>

      <div class="row">
        <div class="col-6">
          <h2>Você</h2>
          <div class="player__grid">
            <div
              v-for="(row, rowIndex) of player.grid.rows"
              :key="rowIndex"
              class="letterRow"
            >
              <div
                v-for="(col, colIndex) of player.grid.cols"
                :key="colIndex"
                class="letterContainer"
                :class="getKeyClass(rowIndex, colIndex)"
              >
                <span
                  v-if="
                    player.guesses[rowIndex] &&
                    player.guesses[rowIndex][colIndex]
                  "
                >
                  <b>{{ player.guesses[rowIndex][colIndex].toUpperCase() }}</b>
                </span>
                <span v-else>&nbsp;</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6">
          <h2>Oponente</h2>
          <div class="player__grid">
            <div
              v-for="(row, rowIndex) of enemy.grid.rows"
              :key="rowIndex"
              class="letterRow"
            >
              <div
                v-for="(col, colIndex) of enemy.grid.cols"
                :key="colIndex"
                class="letterContainer"
                :class="getKeyClass(rowIndex, colIndex, true)"
              >
                &nbsp;
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-center gap-2 mb-4">
        <button class="btn btn-outline-danger" @click="deleteLastKey()">
          Apagar última letra
        </button>
        <button
          class="btn btn-outline-success"
          @click="confirmGuess()"
          :disabled="!isCurrentRowFull()"
        >
          Confimar
        </button>
      </div>

      <div>
        <div
          v-for="(keyRow, index) of keyboard"
          :key="index"
          class="d-flex justify-content-center gap-1 mb-1"
        >
          <button
            v-for="keyLetter of keyRow"
            :key="keyLetter"
            class="btn btn-outline-secondary keyboard__letter"
            @click="onKeyPress(keyLetter)"
          >
            {{ keyLetter.toUpperCase() }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore'

export default {
  data() {
    return {
      isLoading: {
        match: true,
      },

      isHost: true,
      localPlayerId: null,

      matchId: null,
      matchDocRef: null,
      match: null,
      unsubscribeDbListener: null,
      error: null,

      playerKey: null,
      player: {
        grid: {
          rows: 6,
          cols: 5,
        },
        currentRow: 0,
        guesses: [],
      },

      enemy: {
        grid: {
          rows: 6,
          cols: 5,
        },
        guesses: [],
      },

      keyboard: [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
      ],
    }
  },

  created() {
    this.matchId = this.$route.params.gameId
    this.getLocalPlayerId()
    this.loadMatch()
  },

  methods: {
    getLocalPlayerId() {
      let localId = localStorage.getItem('hostId')

      localId = localId && localId.trim() ? localId : this.uuidv4()

      localStorage.setItem('hostId', localId)
      this.localPlayerId = localId
    },

    uuidv4() {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (
          c ^
          (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
      )
    },

    getPlayerKey() {
      return this.isHost ? 'host' : 'enemy'
    },

    getEnemyPlayerKey() {
      return this.isHost ? 'enemy' : 'host'
    },

    async loadMatch() {
      this.isLoading.match = true

      this.matchDocRef = doc(this.$db, 'matches', this.matchId)
      const match = await getDoc(this.matchDocRef)

      if (!match.exists()) {
        this.error = 'Esta partida não existe mais 😶'
        this.isLoading.match = false
        return
      }

      this.match = match.data()
      this.isHost = this.match.host.id == this.localPlayerId
      this.playerKey = this.getPlayerKey()
      this.player.guesses = Object.values(this.match[this.playerKey].guesses)

      this.player.currentRow =
        this.player.guesses.length == 0 ? 0 : this.player.guesses.length - 1
      this.confirmGuess()

      this.attachDbListener()

      this.isLoading.match = false
    },

    onKeyPress(key) {
      if (this.isPlayerGridFull() || this.isCurrentRowFull()) {
        return
      }

      const row = this.getCurrentRow()
      row.push(key)

      this.saveToDb()
      this.$forceUpdate()
    },

    isPlayerGridFull() {
      const gridPlacesCount = this.player.grid.rows * this.player.grid.cols
      const filledGridPlacesCount = this.player.guesses.reduce((carry, row) => {
        carry += row.length
        return carry
      }, 0)
      return filledGridPlacesCount >= gridPlacesCount
    },

    getCurrentRow() {
      if (this.player.guesses.length === 0) {
        this.player.guesses.push([])
      }

      const rowIndex = this.player.currentRow
      const row = this.player.guesses[rowIndex]

      return row
    },

    deleteLastKey() {
      const row = this.getCurrentRow()
      const lastKeyIndex = row.length - 1
      row.splice(lastKeyIndex, 1)
      this.$forceUpdate()
      this.saveToDb()
    },

    isRowConfirmed(rowIndex) {
      return this.player.currentRow > rowIndex
    },

    isRowFull(row) {
      if (row) {
        return row.length >= this.player.grid.cols
      }
    },

    isCurrentRowFull() {
      return this.isRowFull(this.player.guesses[this.player.currentRow])
    },

    confirmGuess() {
      if (!this.isCurrentRowFull()) {
        return
      }

      const guessWord = this.getCurrentRow().join('')
      const isGuessCorrect = guessWord == this.match.word
      if (isGuessCorrect) {
        return this.finishGame()
      }

      this.player.currentRow++
      this.player.guesses[this.player.currentRow] = []
    },

    getKeyClass(rowIndex, colIndex, isEnemy) {
      if (!isEnemy && !this.isRowConfirmed(rowIndex)) {
        return
      }

      const key = isEnemy
        ? this.enemy?.guesses?.[rowIndex]?.[colIndex]
        : this.player.guesses[rowIndex][colIndex]

      if (!key) {
        return
      }

      return this.isKeyCorrect(key, colIndex)
        ? 'bg-success'
        : this.isKeyInWord(key)
        ? 'bg-warning'
        : 'bg-danger'
    },

    isKeyCorrect(key, keyIndex) {
      return this.match.word.charAt(keyIndex) == key
    },

    isKeyInWord(key) {
      return this.match.word.indexOf(key) !== -1
    },

    saveToDb(extraData) {
      let index = 0
      const arrayObjectOfGuesses = {}

      // we need this 'cause firebase don't allow nested arrays
      this.player.guesses.forEach((row) => {
        arrayObjectOfGuesses[index] = row
        index++
      })

      let dataToUpdate = {
        [this.playerKey]: {
          id: this.localPlayerId,
          guesses: arrayObjectOfGuesses,
        },
      }

      if (extraData) {
        dataToUpdate = {
          ...dataToUpdate,
          ...extraData,
        }
      }

      updateDoc(this.matchDocRef, dataToUpdate)
    },

    attachDbListener() {
      this.unsubscribeDbListener = onSnapshot(this.matchDocRef, (doc) => {
        const data = doc.data()
        this.enemy.guesses = Object.values(
          data[this.getEnemyPlayerKey()].guesses
        )
        this.match.winner = data.winner
      })
    },

    finishGame() {
      this.saveToDb({
        winner: this.localPlayerId,
      })
      this.match.winner = this.localPlayerId
    },

    isLocalPlayerWinner() {
      return this.match.winner == this.localPlayerId
    },

    getShareLink() {
      const text = `Venha me enfrentar no Palavreando: ${window.location.href}`
      const encodedText = encodeURIComponent(text)
      return `https://api.whatsapp.com/send?text=${encodedText}`
    },
  },
}
</script>

<style scoped>
.letterRow {
  display: flex;
  justify-content: center;
  gap: 1em;
  margin-bottom: 1em;
}

.letterContainer {
  padding: 1em 1.5em;
  border: 1px solid black;
  border-radius: 8px;
}

.keyboard__letter {
  padding: 1em;
  border: 1px solid black;
  border-radius: 8px;
  cursor: pointer;
}
</style>

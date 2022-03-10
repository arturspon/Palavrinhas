<template>
  <div class="container pb-4">
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
      v-else-if="match && match.winner"
      class="alert"
      :class="[isLocalPlayerWinner() ? 'alert-success' : 'alert-info']"
    >
      <p>
        <b>Partida finalizada!</b>
        <br />
        <span>A palavra era: {{ match.word.toUpperCase() }}</span>
      </p>
      <p v-if="isLocalPlayerWinner()">
        😎
        <br />
        Parabéns, você ganhou!
        <br />
        <span>A palavra era: {{ match.word.toUpperCase() }}</span>
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

      <div class="game">
        <div class="grid">
          <div class="playerBoard">
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
                  :class="[
                    getKeyClass(rowIndex, colIndex),
                    getKeyClassForNonExistentWord(rowIndex),
                    getKeyClassForCurrentRow(rowIndex),
                  ]"
                >
                  <span
                    v-if="
                      player.guesses[rowIndex] &&
                      player.guesses[rowIndex][colIndex]
                    "
                  >
                    <b>{{
                      player.guesses[rowIndex][colIndex].toUpperCase()
                    }}</b>
                  </span>
                  <span v-else>&nbsp;</span>
                </div>
              </div>
            </div>
          </div>
          <div class="enemyBoard">
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
              class="btn btn-outline-secondary btn-sm keyboard__letter"
              :class="getKeyboardKeyClass(keyLetter)"
              @click="onKeyPress(keyLetter)"
            >
              {{ keyLetter.toUpperCase() }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import getWords from '@/utils/words'

export default {
  data() {
    return {
      isLoading: {
        match: true,
      },

      words: [],

      isHost: true,
      localPlayerId: null,

      matchId: null,
      matchDocRef: null,
      match: null,
      unsubscribeDbListener: null,
      error: null,

      isCurrentGuessValidWord: true,

      playerKey: null,
      player: {
        grid: {
          rows: 6,
          cols: 5,
        },
        currentRow: 0,
        guesses: [],
        keyStats: {
          right: [],
          halfRight: [],
          wrong: [],
        },
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
      keyStatuses: {},
    }
  },

  created() {
    this.words = getWords()
    this.matchId = this.$route.params.gameId
    this.getLocalPlayerId()
    this.loadMatch()
    this.attachKeyboardListener()
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

    attachKeyboardListener() {
      const validKeys = this.keyboard.reduce(
        (carry, keyboardRow) => [...carry, ...keyboardRow],
        []
      )

      document.addEventListener('keydown', (event) => {
        const pressedKey = event.key.toLowerCase()

        if (pressedKey == 'backspace') {
          return this.deleteLastKey()
        }

        const isValidKey = validKeys.includes(pressedKey)
        if (isValidKey) {
          this.onKeyPress(pressedKey)
        }
      })
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

      this.isCurrentGuessValidWord = true

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

    isValidWord(word) {
      return this.words.indexOf(word) !== -1
    },

    confirmGuess() {
      if (!this.isCurrentRowFull()) {
        return
      }

      const guessWord = this.getCurrentRow().join('')

      if (!this.isValidWord(guessWord)) {
        this.isCurrentGuessValidWord = false
        return
      }

      this.isCurrentGuessValidWord = true

      const isGuessCorrect = guessWord == this.match.word
      if (isGuessCorrect) {
        return this.finishGame()
      }

      this.player.currentRow++
      this.player.guesses[this.player.currentRow] = []
      this.updateKeyStatuses()
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
        ? 'bg-success text-white'
        : this.isKeyInWord(key)
        ? 'bg-warning'
        : 'bg-danger text-white'
    },

    getKeyClassForNonExistentWord(rowIndex) {
      if (this.player.currentRow == rowIndex && !this.isCurrentGuessValidWord) {
        return 'letterContainer--invalidWord'
      }
    },

    getKeyClassForCurrentRow(rowIndex) {
      const isCurrentRow = rowIndex == this.player.currentRow
      return isCurrentRow && 'letterContainer--currentRow'
    },

    getKeyboardKeyClass(key) {
      return this.keyStatuses[key] == 'right'
        ? 'bg-success text-white'
        : this.keyStatuses[key] == 'halfRight'
        ? 'bg-warning'
        : this.keyStatuses[key] == 'wrong'
        ? 'bg-danger text-white'
        : ''
    },

    updateKeyStatuses() {
      for (const [rowIndex, row] of this.player.guesses.entries()) {
        if (
          row.length == 0 ||
          row.length < this.player.grid.cols ||
          this.player.currentRow == rowIndex
        ) {
          continue
        }

        for (const [colIndex, key] of row.entries()) {
          this.keyStatuses[key] = this.isKeyCorrect(key, colIndex)
            ? 'right'
            : this.isKeyInWord(key)
            ? 'halfRight'
            : 'wrong'
        }
      }
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
.game {
  display: flex;
  flex-flow: column;
  justify-content: center;
  flex: 1;
}

.grid {
  display: flex;
  flex-flow: row;
  justify-content: space-evenly;
  margin-bottom: 16px;
  flex: 1;
}

.letterRow {
  display: flex;
  justify-content: center;
  gap: 0.75em;
  margin-bottom: 0.8rem;
}

.letterContainer {
  padding: 1em 1.4rem;
  border: 1px solid black;
  border-radius: 8px;
}

.letterContainer--currentRow {
  border: 2px solid black;
}

.letterContainer--invalidWord {
  border: 2px solid #ff0000;
}

.keyboard__letter {
  padding: 1rem;
  border: 1px solid black;
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 700px) {
  .grid {
    flex-flow: column-reverse;
  }

  .letterRow {
    gap: 0.5rem;
  }

  .letterContainer {
    padding: 0.5rem 1rem;
  }

  .keyboard__letter {
    padding: 0.5rem;
  }

  .playerBoard {
    flex: 1;
  }

  .enemyBoard > .player__grid > .letterRow {
    margin-bottom: 0.1rem;
  }
  .enemyBoard > .player__grid > .letterRow > .letterContainer {
    padding: 0.1rem 0.7em;
  }
}
</style>

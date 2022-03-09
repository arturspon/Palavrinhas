<template>
  <div>
    <h1>Palavreando</h1>

    <div v-if="isLoading.match" class="spinner-border" style="width: 3rem; height: 3rem;" role="status">
      <span class="visually-hidden">Carregando...</span>
    </div>

    <div v-else>
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
                    player.guesses[rowIndex] && player.guesses[rowIndex][colIndex]
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
// import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore'

export default {
  data() {
    return {
      isLoading: {
        match: true,
      },

      isHost: true,

      matchId: 'test',
      matchDocRef: null,
      match: null,
      unsubscribeDbListener: null,

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
    this.playerKey = this.getPlayerKey()
    this.loadMatch()
  },

  methods: {
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
      console.log(match.data())

      if (!match.exists) {
        // TODO: mostrar erro
        // return
      }

      this.match = match.data()
      this.attachDbListener()

      this.isLoading.match = false
    },

    onKeyPress(key) {
      if (this.isPlayerGridFull() || this.isCurrentRowFull()) {
        return
      }

      const row = this.getCurrentRow()
      // this.isRowFull(row) ? this.player.guesses.push([key]) : row.push(key)
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

      // const rowIndex = this.player.guesses.length - 1
      const rowIndex = this.player.currentRow
      const row = this.player.guesses[rowIndex]

      return row
    },

    deleteLastKey() {
      const row = this.getCurrentRow()
      const lastKeyIndex = row.length - 1
      row.splice(lastKeyIndex, 1)
      this.$forceUpdate()
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
        : (this.isKeyInWord(key) ? 'bg-warning' : 'bg-danger')
    },

    isKeyCorrect(key, keyIndex) {
      return this.match.word.charAt(keyIndex) == key
    },

    isKeyInWord(key) {
      return this.match.word.indexOf(key) !== -1
    },

    saveToDb() {
      console.log(this.player.guesses)

      let index = 0
      const arrayObject = {}

      // we need this 'cause firebase don't allow nested arrays
      this.player.guesses.forEach(row => {
        arrayObject[index] = row
        index++
      })

      updateDoc(this.matchDocRef, {
        [this.playerKey]: {
          guesses: arrayObject
        }
      })
    },

    attachDbListener() {
      this.unsubscribeDbListener = onSnapshot(this.matchDocRef, doc => {
        const data = doc.data()

        // const enemyVar = this.getPlayerKey() == 'host'
        //   ? this.player : this.enemy
        this.enemy.guesses = Object.values(data[this.getEnemyPlayerKey()].guesses)

        // const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        // console.log(source, " data: ", doc.data());
      })
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

<template>
  <div class="container mt-2">
    <PlayerBoard
      :grid="player.grid"
      :matchWord="word"
      :player="player"
      :isCurrentGuessValidWord="isCurrentGuessValidWord"
      :shakeInvalidWord="shakeInvalidWord"
      :rerenderCount="rerenderCount"
      :title="null"
    />
    <div class="card mt-2">
      <div class="card-body">
        <div class="d-flex justify-content-center gap-2 mb-3">
          <button class="btn btn-outline-danger btn-sm" @click="deleteLastKey()">
            Apagar última letra
          </button>
          <button
            class="btn btn-outline-success btn-sm"
            @click="confirmGuess()"
            :disabled="!isCurrentRowFull()"
          >
            Confimar
          </button>
        </div>
        <GameKeyboard @keyPress="onKeyPress" :keyStatuses="keyStatuses" />
      </div>
    </div>
  </div>
</template>

<script>
import { getAllPtBrWords } from '@/utils/words'
import { getRandomWord } from '@/utils/words'
import { isKeyCorrect, isKeyInWord } from '@/services/match'
import PlayerBoard from '@/components/boards/PlayerBoard'
import GameKeyboard from '@/components/game/GameKeyboard'

const words = getAllPtBrWords()

export default {
  components: {
    PlayerBoard,
    GameKeyboard,
  },

  data() {
    return {
      word: null,

      player: {
        grid: {
          rows: 6,
          cols: 5,
        },
        currentRow: 0,
        guesses: [],
      },

      isCurrentGuessValidWord: true,
      shakeInvalidWord: false,
      rerenderCount: 0,

      keyStatuses: {},
    }
  },

  created() {
    this.word = getRandomWord()
  },

  methods: {
    onKeyPress(key) {
      if (key == '✔' || key == 'enter') {
        return this.confirmGuess()
      } else if (key == 'DEL' || key == 'backspace') {
        return this.deleteLastKey()
      } else if (this.isPlayerGridFull() || this.isCurrentRowFull()) {
        return
      }

      const row = this.getCurrentRow()
      row.push(key)
      this.rerenderCount++
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
      this.rerenderCount++
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
      return words.indexOf(word) !== -1
    },

    isCurrentRow(rowIndex) {
      return rowIndex == this.player.currentRow
    },

    confirmGuess() {
      if (!this.isCurrentRowFull()) {
        return
      }

      const guessWord = this.getCurrentRow().join('')

      if (!this.isValidWord(guessWord)) {
        this.isCurrentGuessValidWord = false

        this.shakeInvalidWord = false
        this.$nextTick(() => {
          this.shakeInvalidWord = true

          setTimeout(() => {
            this.shakeInvalidWord = false
          }, 1000)
        })

        this.$swal({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          icon: 'error',
          title: 'Palavra inválida',
          text: 'Apague e tente outra.',
        })
        return
      }

      this.isCurrentGuessValidWord = true

      const isLastGuess = this.player.currentRow == this.player.grid.rows - 1
      const isGuessCorrect = guessWord == this.word

      if (isGuessCorrect) {
        return this.finishGame(true)
      } else if (isLastGuess) {
        return this.finishGame(false)
      }

      this.player.currentRow++
      this.player.guesses[this.player.currentRow] = []
      this.updateKeyStatuses()
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
          this.keyStatuses[key] = isKeyCorrect(this.word, key, colIndex)
            ? 'right'
            : isKeyInWord(this.word, key)
            ? 'halfRight'
            : 'wrong'
        }
      }
    },

    finishGame(isWinner) {
      console.log({ isWinner })
    },
  },
}
</script>

<style scoped>
.card {
  background-color: #eeeeee;
}
</style>

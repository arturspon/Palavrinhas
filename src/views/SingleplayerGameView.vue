<template>
  <div class="container mt-2">
    <div v-if="isWinner !== null" class="gameResult">
      <div class="alert" :class="[isWinner ? 'alert-success' : 'alert-danger']">
        <p>
          <b class="fs-5">
            {{ isWinner ? '😎 Parabéns, você ganhou!' : 'Você perdeu.' }}
          </b>
          <br />
          <span>A palavra era: {{ word.toUpperCase() }}</span>
        </p>
        <p v-if="!isWinner">Lembre-se, sempre há a próxima partida 😉</p>

        <div class="d-flex justify-content-center flex-wrap gap-3">
          <div>
            <span>Seu resultado:</span>
            <div v-html="getGameResultEmojisText('<br>')"></div>
          </div>
        </div>

        <div class="mt-4 d-flex flex-column align-items-center gap-1">
          <button
            class="btn btn-primary"
            @click="rematch()"
            :disabled="isLoading.rematch"
          >
            <template v-if="isLoading.rematch">
              <span
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              <span class="visually-hidden">Carregando...</span>
            </template>
            <template v-else>Jogar de novo</template>
          </button>
          <a
            :href="getUrlToShareGameResultWhatsApp()"
            class="btn btn-success"
            target="_blank"
          >
            Compartilhar seu resultado no WhatsApp
          </a>
          <router-link
            :to="{ name: 'home' }"
            class="btn btn-secondary"
            :disabled="isLoading.rematch"
          >
            Voltar para a página inicial
          </router-link>
        </div>
      </div>
    </div>

    <div class="game" v-else>
      <StopWatch ref="stopwatch" class="mb-2" />

      <SinglePlayerBoard
        class="playerBoard"
        :grid="player.grid"
        :matchWord="word"
        :player="player"
        :isCurrentGuessValidWord="isCurrentGuessValidWord"
        :shakeInvalidWord="shakeInvalidWord"
        :rerenderCount="rerenderCount"
        :title="null"
      />

      <GameKeyboard
        class="mt-2"
        @keyPress="onKeyPress"
        :keyStatuses="keyStatuses"
      />
    </div>
  </div>
</template>

<script>
import { getAllPtBrWords } from '@/utils/words'
import { getRandomWord } from '@/utils/words'
import { isKeyCorrect, isKeyInWord } from '@/services/match'
import SinglePlayerBoard from '@/components/boards/SinglePlayerBoard'
import GameKeyboard from '@/components/game/GameKeyboard'
import StopWatch from '@/components/game/StopWatch'
import {
  getGameResultEmojis,
  getUrlGameResultWhatsApp,
} from '@/utils/ShareUtils'
import {
  saveGameData,
  getSavedGameData,
  resetGameData,
} from '@/utils/SinglePlayerUtils'

const words = getAllPtBrWords()

export default {
  components: {
    SinglePlayerBoard,
    GameKeyboard,
    StopWatch,
  },

  data() {
    return {
      isLoading: {
        rematch: false,
      },

      word: null,

      player: {
        grid: {
          rows: 6,
          cols: 5,
        },
        currentRow: 0,
        guesses: [],
      },

      isWinner: null,

      isCurrentGuessValidWord: true,
      shakeInvalidWord: false,
      rerenderCount: 0,

      keyStatuses: {},
    }
  },

  created() {
    this.init()
  },

  methods: {
    init() {
      const savedGameData = getSavedGameData()

      if (!savedGameData) {
        this.word = getRandomWord()
        return
      }

      this.word = savedGameData.word
      this.player = savedGameData.player
      this.isWinner = savedGameData.isWinner
      this.keyStatuses = savedGameData.keyStatuses

      this.confirmGuess()
    },

    saveGame() {
      saveGameData({
        word: this.word,
        player: this.player,
        isWinner: this.isWinner,
        keyStatuses: this.keyStatuses,
      })
    },

    onKeyPress(key) {
      if (key == '✔' || key == 'enter') {
        return this.confirmGuess()
      } else if (key == 'del' || key == 'backspace') {
        return this.deleteLastKey()
      } else if (this.isPlayerGridFull() || this.isCurrentRowFull()) {
        return
      }

      const row = this.getCurrentRow()
      row.push(key)
      this.rerenderCount++

      this.saveGame()
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
          const statusText = isKeyCorrect(this.word, key, colIndex)
            ? 'right'
            : isKeyInWord(this.word, key)
            ? 'halfRight'
            : 'wrong'
          this.$set(this.keyStatuses, key, statusText)
        }
      }
    },

    finishGame(isWinner) {
      this.$refs.stopwatch.clearTimer()
      this.isWinner = isWinner
      this.saveGame()
    },

    getGameResultEmojisText(lineBreakCharacter) {
      return getGameResultEmojis(this.player, this.word, lineBreakCharacter)
    },

    getUrlToShareGameResultWhatsApp() {
      return getUrlGameResultWhatsApp(
        this.player,
        this.word,
        this.isWinner,
        true
      )
    },

    async rematch() {
      this.isLoading.rematch = true
      await resetGameData()
      this.$router.go()
    },
  },
}
</script>

<style scoped>
@media (max-width: 700px) {
  .game {
    display: flex;
    flex-direction: column;
    height: 90vh;
  }
  .playerBoard {
    flex: 1;
  }
}
.card {
  background-color: #eeeeee;
}
.gameResult {
  height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

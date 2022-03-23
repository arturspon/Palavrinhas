<template>
  <div
    class="gameViewRoot d-flex align-items-center justify-content-center py-2"
  >
    <div class="container">
      <div
        v-if="!user || !user.uid || isLoading.match"
        class="spinner-border text-white"
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

      <div v-else-if="isMatchFull" class="alert alert-warning">
        <p>Oops... Essa partida já está cheia!</p>
        <div class="mt-2">
          <router-link :to="{ name: 'home' }" class="btn btn-primary">
            Iniciar nova partida
          </router-link>
        </div>
      </div>

      <div v-else-if="match && match.winner" class="vh-90 d-flex justify-content-center align-items-center">
        <div
          class="alert"
          :class="[isLocalPlayerWinner() ? 'alert-success' : 'alert-danger']"
        >
          <p>
            <b class="fs-5">
              {{
                isLocalPlayerWinner()
                  ? '😎 Parabéns, você ganhou!'
                  : 'Você perdeu.'
              }}
            </b>
            <br />
            <span>A palavra era: {{ match.word.toUpperCase() }}</span>
          </p>
          <p v-if="!isLocalPlayerWinner()">
            Lembre-se, sempre há a próxima partida 😉
          </p>

          <div class="d-flex justify-content-center flex-wrap gap-3">
            <div>
              <span>Seu resultado:</span>
              <div v-html="getGameResultEmojis('<br>')"></div>
            </div>
            <div>
              <span>Resultado do oponente:</span>
              <div v-html="getGameResultEmojis('<br>', true)"></div>
            </div>
          </div>

          <div class="mt-3">
            <button
              class="btn btn-primary"
              @click="playAnotherMatch(false)"
              :disabled="
                isLoading.playAnotherMatchAnotherEnemy ||
                isLoading.playAnotherMatchSameEnemy
              "
            >
              <template v-if="isLoading.playAnotherMatchAnotherEnemy">
                <span
                  class="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span class="visually-hidden">Carregando...</span>
              </template>
              <template v-else>Jogar com outro oponente</template>
            </button>

            <br />

            <button
              class="btn btn-warning mt-1"
              @click="playAnotherMatch(true)"
              :disabled="
                isLoading.playAnotherMatchSameEnemy ||
                isLoading.playAnotherMatchAnotherEnemy
              "
            >
              <template v-if="isLoading.playAnotherMatchSameEnemy">
                <span
                  class="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span class="visually-hidden">Carregando...</span>
              </template>
              <template v-else-if="isLocalPlayerWinner()">Jogar com o mesmo oponente</template>
              <template v-else>Pedir revanche</template>
            </button>

            <br />

            <a
              :href="buildWhatsAppUrl(shareGameResult())"
              class="btn btn-success mt-1"
              target="_blank"
            >
              Compartilhar
              {{ isLocalPlayerWinner() ? 'vitória' : 'resultado' }} no WhatsApp
            </a>
          </div>
        </div>

      </div>

      <div v-else>
        <div
          v-if="isWaitingEnemyJoinRematch() || isWaitingEnemyJoin()"
          class="vh-90 d-flex align-items-center justify-content-center"
        >
          <div>
            <div
              v-if="isWaitingEnemyJoinRematch()"
              class="alert alert-secondary p-4"
            >
              <p>Aguardando seu oponente aceitar seu pedido de novo jogo...</p>
              <router-link
                :to="{ name: 'home' }"
                class="btn btn-outline-danger"
              >
                Cancelar e ir para página inicial
              </router-link>
            </div>
            <div
              v-else-if="isWaitingEnemyJoin()"
              class="mt-4 alert alert-secondary p-4"
            >
              <p>
                Aguardando seu oponente entrar...
                <br />
                Você precisa convidar seu amigo e pedir para ele entrar no link.
              </p>
              <a
                :href="getShareLink()"
                target="_blank"
                class="btn btn-success btn-lg"
              >
                Compartilhar link no WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div v-else class="game">
          <div class="grid gap-2">
            <div class="playerBoard">
              <PlayerBoard
                class="h-100"
                :grid="player.grid"
                :matchWord="match.word"
                :player="player"
                :isCurrentGuessValidWord="isCurrentGuessValidWord"
                :shakeInvalidWord="shakeInvalidWord"
                :rerenderCount="rerenderCount"
              />
            </div>
            <!-- <div class="d-md-none py-1"></div> -->
            <div class="enemyBoard">
              <EnemyBoard class="h-100" :matchWord="match.word" :enemy="enemy" />
            </div>
          </div>

          <GameKeyboard
            class="mt-2"
            @keyPress="onKeyPress"
            :keyStatuses="keyStatuses"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { getAllPtBrWords } from '@/utils/words'
import {
  createMatch,
  rematch,
  isKeyCorrect,
  isKeyInWord,
  saveInvalidWordToDb,
} from '@/services/match'
import PlayerBoard from '@/components/boards/PlayerBoard'
import EnemyBoard from '@/components/boards/EnemyBoard'
import GameKeyboard from '@/components/game/GameKeyboard'

const saveToDbDebounceIntervalSeconds = 1
const words = getAllPtBrWords()

export default {
  components: {
    PlayerBoard,
    EnemyBoard,
    GameKeyboard,
  },

  data() {
    return {
      isLoading: {
        match: true,
        playAnotherMatchAnotherEnemy: false,
        playAnotherMatchSameEnemy: false,
      },

      isHost: true,
      localPlayerId: null,

      matchId: null,
      matchDocRef: null,
      match: null,
      unsubscribeDbListener: null,
      error: null,
      isMatchFull: false,
      isRematchDialogVisible: false,
      saveToDbDebounceInterval: false,

      isCurrentGuessValidWord: true,
      shakeInvalidWord: false,

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

      keyStatuses: {},

      rerenderCount: 0,
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

      this.validateCurrentPlayer()
      this.confirmGuess()
      this.attachDbListener()
      this.setInitialDataToDb()

      this.isLoading.match = false
    },

    validateCurrentPlayer() {
      this.isMatchFull =
        this.match[this.getPlayerKey()].id &&
        this.match[this.getPlayerKey()].id != this.localPlayerId
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

      this.saveToDbWithDebounce()
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
      this.saveToDbWithDebounce()
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

        saveInvalidWordToDb(this.$db, guessWord)

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
      const isGuessCorrect = guessWord == this.match.word

      if (isGuessCorrect) {
        return this.finishGame(true)
      } else if (isLastGuess) {
        return this.finishGame(false)
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

      return isKeyCorrect(this.match.word, key, colIndex)
        ? 'bg-success text-white'
        : isKeyInWord(this.match.word, key)
        ? 'bg-warning'
        : 'bg-danger text-white'
    },

    isCurrentRow(rowIndex) {
      return rowIndex == this.player.currentRow
    },

    getKeyboardKeyClass(key) {
      if (key == '✔') {
        return 'border border-success btn-outline-success'
      } else if (key == 'DEL') {
        return 'border border-danger btn-outline-danger'
      }

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
          const statusText = isKeyCorrect(this.match.word, key, colIndex)
            ? 'right'
            : isKeyInWord(this.match.word, key)
            ? 'halfRight'
            : 'wrong'
          this.$set(this.keyStatuses, key, statusText)
        }
      }
    },

    setInitialDataToDb() {
      const data = {
        [this.playerKey]: {
          id: this.localPlayerId,
        },
      }

      setDoc(this.matchDocRef, data, { merge: true })
    },

    saveToDbWithDebounce() {
      if (this.saveToDbDebounceInterval) {
        clearTimeout(this.saveToDbDebounceInterval)
      }

      this.saveToDbDebounceInterval = setTimeout(() => {
        this.saveToDb()
        this.saveToDbDebounceInterval = null
      }, saveToDbDebounceIntervalSeconds * 1000)
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

        if (data?.[this.getEnemyPlayerKey()]?.guesses) {
          this.enemy.guesses = Object.values(
            data[this.getEnemyPlayerKey()].guesses
          )
        }

        this.match = data

        if (data.rematchId && !this.isLoading.playAnotherMatchSameEnemy) {
          this.showRematchDialog()
        }
      })
    },

    isWaitingEnemyJoinRematch() {
      return this.match.parentMatchId && !this.match.isRematchAccepted
    },

    isWaitingEnemyJoin() {
      return !this.match[this.getEnemyPlayerKey()]?.id
    },

    finishGame(isLocalPlayerWinner) {
      const winnerId = isLocalPlayerWinner
        ? this.localPlayerId
        : this.match[this.getEnemyPlayerKey()].id

      this.saveToDb({
        winner: winnerId,
      })

      this.match.winner = winnerId
    },

    isLocalPlayerWinner() {
      return this.match.winner == this.localPlayerId
    },

    getShareLink() {
      const text = `Venha me enfrentar no Palavrinhas: ${window.location.href}`
      return this.buildWhatsAppUrl(text)
    },

    buildWhatsAppUrl(text) {
      const encodedText = encodeURIComponent(text)
      return `https://api.whatsapp.com/send?text=${encodedText}`
    },

    getGameResultEmojis(lineBreakCharacter, fromEnemy) {
      const player = fromEnemy ? this.enemy : this.player
      let emojis = ''

      for (let rowIndex = 0; rowIndex < player.grid.rows; rowIndex++) {
        for (let colIndex = 0; colIndex < player.grid.cols; colIndex++) {
          const key = player.guesses?.[rowIndex]?.[colIndex]
          emojis += !key
            ? '⬜'
            : isKeyCorrect(this.match.word, key, colIndex)
            ? '🟩'
            : isKeyInWord(this.match.word, key)
            ? '🟨'
            : '🟥'
        }
        emojis += lineBreakCharacter
      }

      return emojis
    },

    shareGameResult() {
      const winLoseWord = this.isLocalPlayerWinner() ? 'Ganhei' : 'Perdi'

      let message =
        `${winLoseWord} do meu oponente no *Palavrinhas.com*\n` +
        `A palavra era *${this.match.word.toUpperCase()}*, se liga no resultado:\n\n`

      message += this.getGameResultEmojis('\n')

      message += '\nJogue também em https://palavrinhas.com'
      return message
    },

    async playAnotherMatch(withSameEnemy) {
      this.isLoading.playAnotherMatchAnotherEnemy = !withSameEnemy
      this.isLoading.playAnotherMatchSameEnemy = withSameEnemy

      const docRef = withSameEnemy
        ? await rematch(this.$db, this.matchDocRef, this.match)
        : await createMatch(this.$db)

      this.$router.replace({
        name: 'game',
        params: {
          gameId: docRef.id,
        },
      })
      this.$router.go()
    },

    showRematchDialog() {
      if (this.isRematchDialogVisible) {
        return
      }

      this.$swal({
        title: 'Pedido de revanche',
        text: 'Seu oponente pediu para jogar de novo, você aceita?',
        showCancelButton: true,
        confirmButtonText: 'Aceitar',
        cancelButtonText: 'Cancelar',
      }).then(async (result) => {
        if (result.isConfirmed) {
          const rematchDocRef = doc(this.$db, 'matches', this.match.rematchId)

          await updateDoc(
            rematchDocRef,
            { isRematchAccepted: true },
            { merge: true }
          )

          this.$router.replace({
            name: 'game',
            params: {
              gameId: this.match.rematchId,
            },
          })
          this.$router.go()
        }
      })

      this.isRematchDialogVisible = true
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

.card {
  background-color: #eeeeee;
}

.vh-90 {
  height: 90vh;
}

.playerBoard, .enemyBoard {
  flex: 1;
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
    min-width: 25px;
    flex: 1;
  }

  .letterRow {
    margin-bottom: 0.1rem;
  }
  .letterContainer {
    padding: 0rem 0.6em;
  }

  .gameKeyboardContainer, .gameKeyboardContainer > .card {
    width: 100%;
  }
}
</style>

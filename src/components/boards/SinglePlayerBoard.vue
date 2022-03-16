<template>
  <div class="card">
    <div class="card-body boardContent">
      <h4 v-if="title" class="playerLabel">{{ title }}</h4>
      <div class="d-flex flex-column h-100 w-100">
      <!-- <div class="pt-2"> -->
      <!-- <div class="d-flex flex-column"> -->
        <div
          v-for="(row, rowIndex) of grid.rows"
          :key="rowIndex"
          class="letterRow animate__animated"
          :class="{
            animate__shakeX: shakeInvalidWord && isCurrentRow(rowIndex),
          }"
        >
          <div
            v-for="(col, colIndex) of grid.cols"
            :key="colIndex"
            class="letterContainer animate__animated"
            :class="[
              getKeyClass(rowIndex, colIndex),
              getKeyClassForNonExistentWord(rowIndex),
              getKeyClassForCurrentRow(rowIndex),
              getKeyClassAnimationCurrentLetter(rowIndex, colIndex),
            ]"
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
  </div>
</template>

<script>
import { isKeyCorrect, isKeyInWord } from '@/services/match'

export default {
  props: {
    grid: Object,
    matchWord: String,
    player: Object,
    isCurrentGuessValidWord: Boolean,
    shakeInvalidWord: Boolean,
    rerenderCount: Number,
    title: {
      type: String,
      required: false,
      default: 'Você',
    },
  },

  watch: {
    rerenderCount: {
      handler() {
        this.$forceUpdate()
      },
    },
  },

  methods: {
    getKeyClass(rowIndex, colIndex) {
      if (!this.isRowConfirmed(rowIndex)) {
        return
      }

      const key = this.player.guesses[rowIndex][colIndex]

      if (!key) {
        return
      }

      return isKeyCorrect(this.matchWord, key, colIndex)
        ? 'bg-success text-white'
        : isKeyInWord(this.matchWord, key)
        ? 'bg-warning'
        : 'bg-danger text-white'
    },

    getKeyClassForNonExistentWord(rowIndex) {
      if (this.player.currentRow == rowIndex && !this.isCurrentGuessValidWord) {
        return 'letterContainer--invalidWord'
      }
    },

    getKeyClassForCurrentRow(rowIndex) {
      const isCurrentRow = this.isCurrentRow(rowIndex)
      return isCurrentRow && 'letterContainer--currentRow'
    },

    getKeyClassAnimationCurrentLetter(rowIndex, colIndex) {
      if (
        !this.player.guesses ||
        !Array.isArray(this.player.guesses) ||
        this.player.guesses.length == 0
      ) {
        return
      }

      const index =
        this.player.guesses.length == 0 ? 0 : this.player.guesses.length - 1
      const row = this.player.guesses[index]

      if (!row || !Array.isArray(row)) {
        return
      }

      const isCurrentCol = row.length == colIndex + 1

      if (!this.isCurrentRow(rowIndex) || !isCurrentCol) {
        return
      }

      return 'animate__bounceIn'
    },

    isCurrentRow(rowIndex) {
      return rowIndex == this.player.currentRow
    },

    isRowConfirmed(rowIndex) {
      return this.player.currentRow > rowIndex
    },
  },
}
</script>

<style scoped>
.letterRow {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
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

.card {
  background-color: #eeeeee;
}

@media (max-width: 700px) {
  .letterRow {
    gap: 0.2em;
    margin-bottom: 0.25rem;
  }

  .letterContainer {
    padding: 0rem 0.6em;
  }

  .boardContent {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .boardContent > .d-flex {
    justify-content: center;
  }

  .letterContainer {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
  }
}
</style>

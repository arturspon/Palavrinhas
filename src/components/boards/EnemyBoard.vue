<template>
  <div class="card">
    <div class="card-body boardContent">
      <h4>Oponente</h4>
      <div>
        <div
          v-for="(row, rowIndex) of enemy.grid.rows"
          :key="rowIndex"
          class="letterRow"
        >
          <div
            v-for="(col, colIndex) of enemy.grid.cols"
            :key="colIndex"
            class="letterContainer"
            :class="getKeyClass(rowIndex, colIndex)"
          >
            &nbsp;
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
    matchWord: String,
    enemy: Object,
  },

  methods: {
    getKeyClass(rowIndex, colIndex) {
      const key = this.enemy?.guesses?.[rowIndex]?.[colIndex]

      if (!key) {
        return
      }

      return isKeyCorrect(this.matchWord, key, colIndex)
        ? 'bg-success text-white'
        : isKeyInWord(this.matchWord, key)
        ? 'bg-warning'
        : 'bg-danger text-white'
    },
  },
}
</script>

<style scoped>
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

.card {
  background-color: #eeeeee;
}

@media (max-width: 700px) {
  .letterRow {
    gap: 0.5rem;
    margin-bottom: 0.1rem;
  }

  .letterContainer {
    padding: 0rem 0.6em;
  }

  .boardContent {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>

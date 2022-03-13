<template>
  <div class="card px-2">
    <div class="card-body">
      <h2>Oponente</h2>
      <div class="pt-2">
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
    match: Object,
    enemy: Object,
  },

  methods: {
    getKeyClass(rowIndex, colIndex) {
      const key = this.enemy?.guesses?.[rowIndex]?.[colIndex]

      if (!key) {
        return
      }

      return isKeyCorrect(this.match, key, colIndex)
        ? 'bg-success text-white'
        : isKeyInWord(this.match, key)
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
}
</style>

<template>
  <div class="card">
    <div class="card-body">
      <div class="d-flex justify-content-center gap-2 mb-2">
        <button
          class="btn btn-outline-danger btn-sm"
          @click="gameKeyboardOnKeyPress('del')"
        >
          Apagar última letra
        </button>
        <button
          class="btn btn-outline-success btn-sm"
          @click="gameKeyboardOnKeyPress('✔')"
        >
          Confimar
        </button>
      </div>

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
          @click="gameKeyboardOnKeyPress(keyLetter)"
        >
          <!-- <template v-if="keyLetter == 'DEL'">
            APAGAR
          </template>
          <template v-else-if="keyLetter == '✔'">
            CONFIRMAR
          </template>
          <template v-else>
            {{ keyLetter.toUpperCase() }}
          </template> -->
          {{ keyLetter.toUpperCase() }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    keyStatuses: Object,
  },

  data() {
    return {
      keyboard: [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'DEL', '✔'],
      ],
      overrideKeyMap: {
        ç: 'c',
      },
    }
  },

  watch: {
    keyStatuses: {
      handler() {
        this.$forceUpdate()
      },
    },
  },

  created() {
    this.attachKeyboardListener()
  },

  beforeUnmount() {
    document.removeEventListener('keydown', this.keyListenerCallback)
  },

  methods: {
    attachKeyboardListener() {
      document.addEventListener('keydown', this.keyListenerCallback)
    },

    keyListenerCallback(event) {
      const specialKeys = ['backspace', 'enter']
      const validLetterKeys = this.keyboard.reduce(
        (carry, keyboardRow) => [...carry, ...keyboardRow],
        specialKeys
      )

      const pressedKey = this.getCleanKey(event.key)
      const isValidKey = validLetterKeys.includes(pressedKey)

      if (isValidKey) {
        this.$emit('keyPress', pressedKey)
      }
    },

    getCleanKey(key) {
      key = key.toLowerCase()
      return this.overrideKeyMap[key] || key
    },

    gameKeyboardOnKeyPress(key) {
      key = this.getCleanKey(key)
      this.$emit('keyPress', key)
    },

    getKeyboardKeyClass(key) {
      if (key == '✔') {
        return 'border border-success btn-outline-success'
      } else if (key == 'DEL') {
        return 'border border-danger btn-outline-danger flex-3'
      }

      return this.keyStatuses[key] == 'right'
        ? 'bg-success text-white'
        : this.keyStatuses[key] == 'halfRight'
        ? 'bg-warning'
        : this.keyStatuses[key] == 'wrong'
        ? 'bg-danger text-white'
        : ''
    },
  },
}
</script>

<style scoped>
.card {
  background-color: #eeeeee;
}

.keyboard__letter {
  padding: 1rem;
  border: 1px solid black;
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 700px) {
  .card {
    margin-left: -12px;
    margin-right: -12px;
    border-radius: 0;
  }

  .card-body {
    padding: 0.3rem;
  }

  .keyboard__letter {
    padding: 0.5rem;
    min-width: 25px;
    flex: 1;
  }

  .flex-3 {
    flex: 3;
  }
}
</style>

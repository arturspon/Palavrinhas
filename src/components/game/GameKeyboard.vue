<template>
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
        @click="gameKeyboardOnKeyPress(keyLetter)"
      >
        {{ keyLetter.toUpperCase() }}
      </button>
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

  created() {
    this.attachKeyboardListener()
  },

  methods: {
    attachKeyboardListener() {
      const specialKeys = ['backspace', 'enter']
      const validLetterKeys = this.keyboard.reduce(
        (carry, keyboardRow) => [...carry, ...keyboardRow],
        specialKeys
      )

      document.addEventListener('keydown', (event) => {
        const pressedKey = this.getCleanKey(event.key)
        const isValidKey = validLetterKeys.includes(pressedKey)

        if (isValidKey) {
          this.$emit('keyPress', pressedKey)
        }
      })
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
  },
}
</script>

<style>
.keyboard__letter {
  padding: 1rem;
  border: 1px solid black;
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 700px) {
  .keyboard__letter {
    padding: 0.5rem;
    min-width: 25px;
  }
}
</style>

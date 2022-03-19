<template>
  <div class="card">
    <div class="card-body text-center">
      <b>Timer</b>
      <div class="fs-4">
        {{ getReadableTime() }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { saveStopwatchData, getStopwatchData } from '@/utils/SinglePlayerUtils'

export default {
  data() {
    return {
      interval: null,
      secondsElapsed: 0,
    }
  },

  created() {
    this.restoreStopwatchData()
    this.startTimer()
  },

  beforeDestroy() {
    this.clearTimer()
  },

  methods: {
    restoreStopwatchData() {
      const data = getStopwatchData()
      this.secondsElapsed = data || 0
    },

    startTimer() {
      this.interval = setInterval(() => {
        this.secondsElapsed++
        saveStopwatchData(this.secondsElapsed)
      }, 1000)
    },

    clearTimer() {
      clearInterval(this.interval)
      this.interval = null
    },

    getReadableTime() {
      const minutes = Math.floor(this.secondsElapsed / 60)
      const seconds = this.secondsElapsed % 60
      const paddedMinutes = String(minutes).padStart(2, '0')
      const paddedSeconds = String(seconds).padStart(2, '0')
      return `${paddedMinutes}:${paddedSeconds}`
    },
  },
}
</script>

<style></style>

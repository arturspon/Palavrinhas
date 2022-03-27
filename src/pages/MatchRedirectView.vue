<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import LoadingSpinner from '../components/ui/LoadingSpinner.vue'

const router = useRouter()
const route = useRoute()
const newMatchId = route.params.newMatchId

router.replace({
  name: 'game',
  params: {
    gameId: newMatchId,
  },
})
</script>

<template>
  <div class="vertical-center">
    <LoadingSpinner colorClass="text-white" />
  </div>
</template>

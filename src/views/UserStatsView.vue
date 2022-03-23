<template>
  <div class="vertical-center">
    <div class="card">
      <div class="card-body text-center">
        <h3>Estatísticas</h3>

        <LoadingSpinner v-if="!userData" :isLoading="!userData" class="my-3" />

        <div v-else-if="userData.stats" class="d-flex flex-column gap-2 my-3">
          <div>
            <span class="fs-6 badge rounded-pill bg-primary"
              >Total de Partidas</span
            >
            <br />
            <span class="fs-3">{{ userData.stats.matchesCount }}</span>
          </div>
          <div class="d-flex gap-2 justify-content-center">
            <div>
              <span class="fs-6 badge rounded-pill bg-success">Vitórias</span>
              <br />
              <span class="fs-3">{{ userData.stats.winsCount }}</span>
            </div>
            <div>
              <span class="fs-6 badge rounded-pill bg-danger">Derrotas</span>
              <br />
              <span class="fs-3">{{ userData.stats.lossesCount }}</span>
            </div>
          </div>
          <div>
            <span class="fs-6 badge rounded-pill bg-secondary"
              >Taxa de vitória</span
            >
            <br />
            <span class="fs-3">
              {{
                Math.floor(
                  (userData.stats.winsCount / userData.stats.matchesCount) * 100
                )
              }}%
            </span>
          </div>
        </div>

        <router-link
          :to="{ name: 'home' }"
          class="btn btn-secondary btn-sm w-100"
        >
          Voltar
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useAuthStore } from '@/store/AuthStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

export default {
  components: {
    LoadingSpinner,
  },

  computed: {
    ...mapState(useAuthStore, ['userData']),
  },
}
</script>

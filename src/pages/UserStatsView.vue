<template>
  <div class="page vertical-center">
    <div class="container">
      <div class="card">
        <div class="card-body text-center">
          <h2>Estatísticas</h2>

          <LoadingSpinner v-if="!userData" :isLoading="!userData" class="my-3" />

          <div v-else-if="userData.stats" class="d-flex flex-column gap-2 my-4">
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
              <span class="fs-6 badge rounded-pill bg-info"
                >Taxa de vitória</span
              >
              <br />
              <span v-if="userData.stats.matchesCount" class="fs-3">
                {{
                  Math.floor(
                    (userData.stats.winsCount / userData.stats.matchesCount) * 100
                  )
                }}%
              </span>
              <span v-else>N/A</span>
            </div>
          </div>

          <div>
            <router-link
              :to="{ name: 'home' }"
              class="btn btn-secondary"
            >
              Voltar
            </router-link>
          </div>
        </div>
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

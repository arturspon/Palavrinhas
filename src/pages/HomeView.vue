<template>
  <div class="page home vh-100 d-flex align-items-center justify-content-center">
    <div class="card">
      <div class="card-body p-5">
        <img
          src="@/assets/images/logo-192x192.png"
          alt="Logo do Palavrinhas.com"
          height="100"
        />
        <h1>Palavrinhas</h1>

        <div class="mt-3 d-flex flex-column gap-2">
          <router-link
            :to="{ name: 'sp-game' }"
            class="btn btn-primary btn-lg w-100"
          >
            JOGAR SOZINHO
          </router-link>

          <button
            class="btn btn-primary btn-lg w-100"
            :disabled="isLoading.gameCreation"
            @click="play()"
          >
            <template v-if="isLoading.gameCreation">
              <span
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              <span class="visually-hidden">Carregando...</span>
            </template>
            <template v-else>JOGAR COM AMIGOS</template>
          </button>

          <router-link
            v-if="userData && userData.stats && userData.stats.matchesCount > 0"
            :to="{ name: 'stats' }"
            class="btn btn-warning btn-lg w-100"
          >
            ESTATÍSTICAS
          </router-link>

          <button
            class="btn btn-secondary btn-lg w-100"
            data-bs-toggle="modal"
            data-bs-target="#how-to-play-modal"
          >
            REGRAS
          </button>
        </div>
      </div>
    </div>

    <HowToPlayModal />
  </div>
</template>

<script>
import { createMatch } from '@/services/match'
import HowToPlayModal from '@/components/modals/HowToPlayModal.vue'

import { mapState } from 'pinia'
import { useAuthStore } from '@/store/AuthStore'

export default {
  name: 'HomeView',

  components: {
    HowToPlayModal,
  },

  data() {
    return {
      isLoading: {
        gameCreation: false,
      },
    }
  },

  computed: {
    ...mapState(useAuthStore, ['userData']),
  },

  methods: {
    async play() {
      this.isLoading.gameCreation = true

      const docRef = await createMatch(this.$db)

      this.$router.push({
        name: 'game',
        params: {
          gameId: docRef.id,
        },
      })
    },
  },
}
</script>

<style scoped>
  .home > .card {
    min-width: 25%;
  }
</style>

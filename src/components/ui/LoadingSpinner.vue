<template>
  <div
    v-if="isLoading"
    class="spinner-border"
    :class="colorClass"
    style="width: 3rem; height: 3rem"
    role="status"
  >
    <span class="visually-hidden">Carregando...</span>
  </div>
</template>

<script>
export default {
  props: {
    isLoading: {
      type: Boolean,
      required: false,
      default: true,
    },
    colorClass: {
      type: String,
      required: false,
      default: 'text-primary'
    }
  },
}
</script>

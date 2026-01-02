<script setup lang="ts">
import { useConfirmService } from '~/composables/useConfirmService'

const { state, isOpen, confirm, cancel } = useConfirmService()
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #header>
      <span
        class="font-bold"
        :class="state.color === 'error' && 'text-red-600'"
      >
        {{ state.title }}
      </span>
    </template>

    <template #body>
      <p>{{ state.description }}</p>
    </template>

    <template #footer>
      <UButton
        variant="ghost"
        @click="cancel"
      >
        {{ state.cancelLabel }}
      </UButton>

      <UButton
        :color="state.color"
        @click="confirm"
      >
        {{ state.confirmLabel }}
      </UButton>
    </template>
  </UModal>
</template>

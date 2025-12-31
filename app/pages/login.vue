<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: 'blank'
})

/* =========================
  FORM STATE
========================= */
const isPasswordVisible = ref(false)

const formState = reactive({
  email: '',
  password: ''
})

/* =========================
  VALIDATION SCHEMA
========================= */
const schema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter')
})

/* =========================
  SUBMIT HANDLER
========================= */
const onSubmit = (event: FormSubmitEvent<typeof schema>) => {
  // validated data lives here
  const { email, password } = event.data

  // replace with real auth later
  console.log('LOGIN DATA', { email, password })
}
</script>

<template>
  <UCard
    class="bg-white/50 text-black rounded-xl border-0 backdrop-blur-sm shadow-sm min-w-md"
  >
    <AppLogo class="w-auto mx-auto h-14 mb-4 shrink-0" />

    <div class="text-center font-bold text-lg">
      Masuk ke Akun Anda
    </div>
    <p class="text-center text-sm text-neutral-600">
      Silahkan masukan detail login anda
    </p>

    <UForm
      :schema="schema"
      :state="formState"
      class="flex flex-col gap-4 mt-8"
      @submit="onSubmit"
    >
      <!-- EMAIL -->
      <UFormField
        name="email"
        required
      >
        <UInput
          v-model="formState.email"
          type="email"
          class="w-full"
          placeholder="masukan email anda"
          size="xl"
          icon="i-lucide-mail"
        />
      </UFormField>

      <!-- PASSWORD -->
      <UFormField
        name="password"
        required
      >
        <UInput
          v-model="formState.password"
          :type="isPasswordVisible ? 'text' : 'password'"
          placeholder="masukan password anda"
          class="w-full"
          size="xl"
          icon="i-lucide-lock"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="ghost"
              size="md"
              :icon="isPasswordVisible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              @click="isPasswordVisible = !isPasswordVisible"
            />
          </template>
        </UInput>
      </UFormField>

      <UButton
        type="submit"
        class="mt-4 w-full"
        size="xl"
      >
        <span class="mx-auto">Login</span>
      </UButton>
    </UForm>
  </UCard>
</template>

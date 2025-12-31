<script setup lang="ts">
import { useOrgStructure } from '~/composables/useOrgStructure'
import type { TabsItem } from '@nuxt/ui'

const {
  orgFormSchema,
  isOpen,
  scope,
  mode,
  form,
  selectedRT,
  rtItems,
  StructureItems,
  rwData,
  currentRTData,
  openAddModal,
  openEditModal,
  saveData,
  deleteNode
} = useOrgStructure()

const tabs = [
  { label: 'RW', slot: 'rw' },
  { label: 'RT', slot: 'rt' }
] satisfies TabsItem[]
</script>

<template>
  <div class="w-full">
    <!-- MODAL -->
    <UModal
      v-model:open="isOpen"
      size="md"
      class="w-full"
    >
      <template #header>
        {{ mode === 'add' ? 'Tambah' : 'Edit' }} Struktur
      </template>

      <template #body>
        <UForm
          :schema="orgFormSchema"
          :state="form"
          class="w-full space-y-4"
          @submit="saveData"
        >
          <!-- LEVEL -->
          <UFormField class="w-full" required>
            <URadioGroup
              v-model="form.level"
              orientation="horizontal"
              variant="list"
              class="w-full"
              :items="StructureItems"
            />
          </UFormField>

          <!-- RT -->
          <UFormField
            v-if="scope === 'rt'"
            label="RT"
            required
            class="w-full"
          >
            <USelect
              v-model="form.rt"
              :items="rtItems"
              class="w-full"
            />
          </UFormField>

          <!-- TITLE -->
          <UFormField
            label="Jabatan"
            required
            class="w-full"
          >
            <UInput
              v-model="form.title"
              class="w-full"
            />
          </UFormField>

          <!-- NAME -->
          <UFormField
            label="Nama"
            required
            class="w-full"
          >
            <UInput
              v-model="form.name"
              class="w-full"
            />
          </UFormField>

          <!-- ADDRESS -->
          <UFormField
            label="Alamat"
            required
            class="w-full"
          >
            <UInput
              v-model="form.address"
              class="w-full"
            />
          </UFormField>

          <div class="flex w-full items-center justify-between gap-2">
            <!-- DELETE -->
            <UButton
              v-if="mode === 'edit'"
              variant="ghost"
              class="min-w-20"
              @click="deleteNode"
            >
              Hapus
            </UButton>

            <!-- ACTIONS -->
            <div class="ml-auto flex gap-2">
              <UButton
                variant="ghost"
                @click="isOpen = false"
              >
                Batal
              </UButton>

              <UButton
                type="submit"
                color="neutral"
              >
                Simpan
              </UButton>
            </div>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- TABS -->
    <UTabs
      :items="tabs"
      variant="link"
      class="mb-6 w-full"
      :ui="{
        label: 'text-md group-data-[state=inactive]:text-black w-20',
        indicator: 'h-1 bg-primary-600',
        list: 'px-0'
      }"
    >
      <!-- RW -->
      <template #rw>
        <div class="my-4 flex w-full justify-end">
          <UButton @click="openAddModal('rw')">
            Tambah Struktur
          </UButton>
        </div>

        <div class="flex w-full justify-center">
          <OrgChart
            :datasource="rwData"
            @node-click="node => openEditModal('rw', node)"
          />
        </div>
      </template>

      <!-- RT -->
      <template #rt>
        <div class="my-4 flex w-full justify-between gap-4">
          <USelect
            v-model="selectedRT"
            :items="rtItems"
            class="w-40"
          />

          <UButton @click="openAddModal('rt')">
            Tambah Struktur
          </UButton>
        </div>

        <div class="flex w-full justify-center">
          <OrgChart
            :datasource="currentRTData"
            @node-click="node => openEditModal('rt', node)"
          />
        </div>
      </template>
    </UTabs>
  </div>
</template>

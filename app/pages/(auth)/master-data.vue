<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/vue-table'

const tableFamilyCard = useTemplateRef('table')
// const tableFamilyHome = useTemplateRef('home')

const tabs = [
  { label: 'Kartu Keluarga', slot: 'family_card' },
  { label: 'Rumah', slot: 'home' }
] satisfies TabsItem[]

const selectedRT = ref('RT 01')
const rtItems = ['RT 01', 'RT 02', 'RT 03', 'RT 04']

const dataFamilyCard = ref([
  {
    name: 'Jeffery Warden',
    total: 6,
    wife: ['Anna Warden'],
    child: ['Bobby Warden', 'Cindy Warden', 'Derek Warden']
  }
])

const columnsFamilyTable = [
  {
    accessorKey: 'name',
    header: 'Nama'
  },
  {
    accessorKey: 'total',
    header: 'Jumlah Anggota'
  },
  {
    accessorKey: 'wife',
    header: 'Istri'
  },
  {
    accessorKey: 'child',
    header: 'Anak'
  },
  {
    id: 'action',
    header: 'Aksi'
  }
]

const pagination = ref({
  pageIndex: 0,
  pageSize: 5
})
</script>

<template>
  <div>
    <UTabs
      :items="tabs"
      variant="link"
      class="mb-6 w-full"
      :ui="{
        label: 'text-md group-data-[state=inactive]:text-black min-w-full',
        indicator: 'h-1 bg-primary-600',
        list: 'px-0'
      }"
    >
      <template #family_card>
        <div class="my-4 flex w-full justify-between gap-4">
          <USelect
            v-model="selectedRT"
            :items="rtItems"
            class="w-40"
          />

          <UButton
            color="neutral"
            trailing-icon="mdi-plus-circle-outline"
          >
            Tambah Warga
          </UButton>
        </div>

        <div>
          <UTable
            ref="table"
            v-model:pagination="pagination"
            :data="dataFamilyCard"
            :columns="columnsFamilyTable"
            :pagination-options="{
              getPaginationRowModel: getPaginationRowModel()
            }"
            class="flex-1"
          />

          <div class="flex justify-end border-t border-default pt-4 px-4">
            <UPagination
              :page="(tableFamilyCard?.tableApi?.getState().pagination.pageIndex || 0) + 1"
              :items-per-page="tableFamilyCard?.tableApi?.getState().pagination.pageSize"
              :total="tableFamilyCard?.tableApi?.getFilteredRowModel().rows.length"
              @update:page="(p) => tableFamilyCard?.tableApi?.setPageIndex(p - 1)"
            />
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

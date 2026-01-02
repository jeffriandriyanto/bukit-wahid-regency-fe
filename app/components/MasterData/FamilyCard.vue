<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/vue-table'
import { z } from 'zod'

const { reveal: confirm } = useConfirmService()
const tableFamilyCard = useTemplateRef('table')
const selectedRT = ref('RT 01')
const isOpen = ref(false)
const mode = ref<'add' | 'edit'>('add')
const editingIndex = ref<number | null>(null)
const rtItems = ['RT 01', 'RT 02', 'RT 03', 'RT 04']

const FamilyCardFormSchema = z.object({
  family_card_number: z.string().min(1, 'No. Kartu Keluarga wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  rt: z.string().min(1, 'RT wajib diisi'),
  address: z.string().min(1, 'Alamat wajib diisi'),
  total: z.number().optional(),
  nik: z.string().min(16, 'NIK wajib diisi'),
  wife: z.array(
    z.object({
      name: z.string().optional(),
      nik: z.string().optional()
    })
  ),
  child: z.array(
    z.object({
      name: z.string().optional(),
      nik: z.string().optional()
    })
  )
})

type FamilyCardFormSchema = z.infer<typeof FamilyCardFormSchema>

const dataFamilyCard = ref([
  {
    name: 'Jeffery Warden',
    rt: 'RT 01',
    address: 'Jl. Merpati No. 12',
    total: 6,
    wife: [
      {
        name: 'Anna Warden',
        nik: '1234567890123456'
      }
    ],
    child: [
      {
        name: 'Nick Warden',
        nik: '1234567890123456'
      },
      {
        name: 'Lia Warden',
        nik: '1234567890123456'
      },
      {
        name: 'Tommy Warden',
        nik: '1234567890123456'
      }
    ]
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

/* =========================
  FORM STATE
========================= */
interface FamilyCard {
  family_card_number: string
  rt: string
  address: string
  total: number
  name: string
  nik: string
  wife: { name: string, nik: string }[]
  child: { name: string, nik: string }[]
}

const form = reactive<FamilyCard>({
  family_card_number: '',
  rt: '',
  address: '',
  total: 0,
  name: '',
  nik: '',
  wife: [
    {
      name: '',
      nik: ''
    }
  ],
  child: [
    {
      name: '',
      nik: ''
    }
  ]
})

const resetForm = () => {
  form.name = ''
  form.rt = ''
  form.address = ''
  form.total = 0
  form.wife = [
    {
      name: '',
      nik: ''
    }
  ]
  form.child = [
    {
      name: '',
      nik: ''
    }
  ]
}

const openAddModal = () => {
  resetForm()
  mode.value = 'add'
  editingIndex.value = null
  isOpen.value = true
}

const openEditModal = (row: FamilyCard, index: number) => {
  mode.value = 'edit'
  editingIndex.value = index

  form.family_card_number = row.family_card_number ?? ''
  form.rt = row.rt
  form.address = row.address
  form.name = row.name
  form.nik = row.nik
  form.total = row.total

  form.wife = JSON.parse(JSON.stringify(row.wife))
  form.child = JSON.parse(JSON.stringify(row.child))

  isOpen.value = true
}

const confirmDelete = async (index: number) => {
  const ok = await confirm({
    title: 'Hapus Data Keluarga?',
    description: 'Data yang dihapus tidak dapat dikembalikan.',
    confirmLabel: 'Hapus',
    cancelLabel: 'Batal',
    color: 'error'
  })

  if (!ok) return

  dataFamilyCard.value.splice(index, 1)
}

const saveData = async (event: FormSubmitEvent<FamilyCardFormSchema>) => {
  const validated = event.data

  const payload: FamilyCard = {
    family_card_number: validated.family_card_number,
    rt: validated.rt,
    address: validated.address,
    name: validated.name,
    nik: validated.nik,
    wife: JSON.parse(JSON.stringify(validated.wife)),
    child: JSON.parse(JSON.stringify(validated.child)),
    total: 1 + validated.wife.length + validated.child.length
  }

  if (mode.value === 'add') {
    dataFamilyCard.value.push(payload)
  }

  if (mode.value === 'edit' && editingIndex.value !== null) {
    dataFamilyCard.value.splice(editingIndex.value, 1, payload)
  }

  resetForm()
  isOpen.value = false
}
</script>

<template>
  <div>
    <ConfirmDialog />

    <div class="my-4 flex w-full justify-between gap-4">
      <USelect
        v-model="selectedRT"
        :items="rtItems"
        class="w-40"
      />

      <UButton
        color="neutral"
        trailing-icon="mdi-plus-circle-outline"
        @click="openAddModal"
      >
        Tambah Keluarga
      </UButton>

      <UModal
        v-model:open="isOpen"
        :ui="{ content: 'min-w-2xl' }"
      >
        <template #header>
          <span class="font-bold">{{ mode === 'add' ? 'Tambah' : 'Edit' }} Data Warga</span>
        </template>

        <template #body>
          <UForm
            :schema="FamilyCardFormSchema"
            :state="form"
            class="w-full space-y-6"
            @submit="saveData"
          >
            <!-- Kartu Keluarga -->
            <UFormField
              name="family_card_number"
              label="No. Kartu Keluarga"
              required
            >
              <UInput
                v-model="form.family_card_number"
                placeholder="No. Kartu Keluarga"
              />
            </UFormField>

            <!-- Alamat -->
            <div class="flex gap-4">
              <UFormField
                name="rt"
                label="RT"
                required
                class="w-[20%]"
              >
                <USelect
                  v-model="form.rt"
                  :items="rtItems"
                  class="w-full"
                  placeholder="Pilih RT"
                />
              </UFormField>

              <UFormField
                name="address"
                label="Alamat"
                required
                class="w-[80%]"
              >
                <UInput
                  v-model="form.address"
                  placeholder="Alamat"
                />
              </UFormField>
            </div>

            <!-- Kepala Keluarga -->
            <UCard class="bg-neutral-100">
              <div class="grid grid-cols-2 gap-2">
                <UFormField
                  name="name"
                  label="Nama Kepala Keluarga"
                  required
                >
                  <UInput v-model="form.name" />
                </UFormField>

                <UFormField
                  name="nik"
                  label="NIK Kepala Keluarga"
                  required
                >
                  <UInput v-model="form.nik" />
                </UFormField>

                <!-- Istri -->
                <template
                  v-for="(wife, index) in form.wife"
                  :key="`wife-${index}`"
                >
                  <div class="col-span-2 grid grid-cols-12 gap-2 items-end">
                    <UFormField
                      :name="`wife.${index}.name`"
                      :label="`Nama Istri ${
                        form.wife.length > 1 ? index + 1 : ''
                      }`"
                      required
                      class="col-span-6"
                    >
                      <UInput v-model="wife.name" />
                    </UFormField>

                    <UFormField
                      :name="`wife.${index}.nik`"
                      :label="`NIK Istri ${
                        form.wife.length > 1 ? index + 1 : ''
                      }`"
                      required
                      class="col-span-5"
                    >
                      <UInput v-model="wife.nik" />
                    </UFormField>

                    <UButton
                      type="button"
                      color="error"
                      variant="ghost"
                      icon="mdi-trash-can-outline"
                      class="col-span-1"
                      :disabled="form.wife.length === 1"
                      @click="form.wife.splice(index, 1)"
                    />
                  </div>
                </template>
              </div>

              <div class="w-full text-center mt-4">
                <UButton
                  type="button"
                  variant="link"
                  color="info"
                  icon="mdi-plus-circle-outline"
                  @click="form.wife.push({ name: '', nik: '' })"
                >
                  Tambah Istri
                </UButton>
              </div>
            </UCard>

            <!-- Anak -->
            <UCard class="bg-neutral-100">
              <div class="grid grid-cols-2 gap-2">
                <template
                  v-for="(child, index) in form.child"
                  :key="`child-${index}`"
                >
                  <div class="col-span-2 grid grid-cols-12 gap-2 items-end">
                    <UFormField
                      :name="`child.${index}.name`"
                      :label="`Nama Anak ${index + 1}`"
                      required
                      class="col-span-6"
                    >
                      <UInput v-model="child.name" />
                    </UFormField>

                    <UFormField
                      :name="`child.${index}.nik`"
                      :label="`NIK Anak ${index + 1}`"
                      required
                      class="col-span-5"
                    >
                      <UInput v-model="child.nik" />
                    </UFormField>

                    <UButton
                      type="button"
                      color="error"
                      variant="ghost"
                      icon="mdi-trash-can-outline"
                      class="col-span-1 mb-1"
                      :disabled="form.child.length === 1"
                      @click="form.child.splice(index, 1)"
                    />
                  </div>
                </template>
              </div>

              <div class="w-full text-center mt-4">
                <UButton
                  type="button"
                  variant="link"
                  color="info"
                  icon="mdi-plus-circle-outline"
                  class="col-span-2"
                  @click="form.child.push({ name: '', nik: '' })"
                >
                  Tambah Anak
                </UButton>
              </div>
            </UCard>

            <div class="flex w-full items-center justify-between gap-2">
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
          </UForm>
        </template>
      </UModal>
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
      >
        <template #name-cell="{ row }">
          <div class="font-bold">
            {{ row.original.name }}
          </div>

          <div class="text-xs text-neutral-400">
            {{ row.original.address }}
          </div>
        </template>
        <template #wife-cell="{ row }">
          <div class="flex gap-1">
            <span
              v-for="(wife, index) in row.original.wife"
              :key="`wife-${index}`"
            >
              {{ wife.name }}<span>{{ index < row.original.wife.length - 1 ? ',' : '' }}</span>
            </span>
          </div>
        </template>
        <template #child-cell="{ row }">
          <div class="flex gap-1">
            <span
              v-for="(child, index) in row.original.child"
              :key="`child-${index}`"
            >
              {{ child.name }}<span>{{ index < row.original.child.length - 1 ? ',' : '' }}</span>
            </span>
          </div>
        </template>
        <template #action-cell="{ row, rowIndex }">
          <UButton
            icon="i-lucide-pencil"
            variant="ghost"
            @click="openEditModal(row.original, rowIndex)"
          />
          <UButton
            icon="i-lucide-trash-2"
            variant="ghost"
            color="error"
            @click="confirmDelete(rowIndex)"
          />
        </template>
      </UTable>

      <div class="flex justify-end border-t border-default pt-4 px-4">
        <UPagination
          :page="
            (tableFamilyCard?.tableApi?.getState().pagination.pageIndex || 0)
              + 1
          "
          :items-per-page="
            tableFamilyCard?.tableApi?.getState().pagination.pageSize
          "
          :total="tableFamilyCard?.tableApi?.getFilteredRowModel().rows.length"
          @update:page="(p) => tableFamilyCard?.tableApi?.setPageIndex(p - 1)"
        />
      </div>
    </div>
  </div>
</template>

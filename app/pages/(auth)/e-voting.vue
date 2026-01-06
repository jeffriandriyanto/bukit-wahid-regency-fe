<script setup lang="ts">
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { CalendarDate } from '@internationalized/date'
import { VisXYContainer, VisStackedBar, VisAxis } from '@unovis/vue'

import {
  Time,
  today,
  getLocalTimeZone,
  fromDate,
  toCalendarDate
} from '@internationalized/date'
import { z } from 'zod'
import { format } from 'date-fns'

definePageMeta({
  middleware: ['auth']
})

// REFS & SERVICES
const { reveal: confirm } = useConfirmService()
const formRef = useTemplateRef('formRef')
const stepper = useTemplateRef('stepper')

// STATE
const selectedRT = ref('RT 01')
const isOpen = ref(false)
const isOpenResult = ref(false)
const mode = ref<'add' | 'edit'>('add')
const editingIndex = ref<number | null>(null)
const rtItems = ['Semua RT', 'RT 01', 'RT 02', 'RT 03', 'RT 04']
const fileUpload = ref<File[]>([])
const dataResult = ref()

// DATE & TIME OBJECTS (For UI Components)
const dateObject = ref<CalendarDate>(toCalendarDate(today(getLocalTimeZone())))
const timeObject = ref(new Time(0, 0))

// INTERFACES
interface Candidate {
  name: string
  vision: string
  poster: string
}

interface EVotingForm {
  title: string
  shown: string
  date: Date | string
  time: string
  image: string
  candidate: Candidate[] // Fixed: corrected array type
}

// SCHEMA
const EVotingFormSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  shown: z.string().min(1, 'Target RT wajib dipilih'),
  date: z.any(), // Di-handle via dateObject
  time: z.string().min(1, 'Jam wajib diisi'),
  image: z.string().optional(),
  candidate: z
    .array(
      z.object({
        name: z.string().min(1, 'Nama kandidat wajib diisi'),
        vision: z.string().min(1, 'Visi wajib diisi'),
        poster: z.string().optional()
      })
    )
    .min(2, 'Minimal harus ada 2 kandidat')
})

type EVotingFormSchema = z.infer<typeof EVotingFormSchema>

// DATA DUMMY
const dataEVoting = ref([
  {
    title: 'Pemilihan Ketua RW 05',
    shown: 'Semua RT',
    date: '2026-02-15',
    time: '17:00',
    vote: 145,
    vote_yet: 20,
    image: 'https://picsum.photos/seed/voting1/400/225',
    candidate: [
      { name: 'Bapak Subarjo', vision: 'Mewujudkan RW Digital', poster: '' },
      { name: 'Ibu Mulyani', vision: 'RW Hijau dan Asri', poster: '' }
    ]
  }
])

const dataEVotingDone = ref([
  {
    title: 'Pemilihan Ketua RW 05',
    selected_candidate: 'Suprihadi',
    total: '32 Suara',
    vote: 12,
    vote_yet: 122
  }
])

const form = reactive<EVotingForm>({
  title: '',
  shown: 'Semua RT',
  date: '',
  time: '00:00',
  image: '',
  candidate: [
    { name: '', vision: '', poster: '' },
    { name: '', vision: '', poster: '' }
  ]
})

// UTILS
const toUIFormat = (dateInput: Date | string) => {
  const d = new Date(dateInput)
  return toCalendarDate(fromDate(d, getLocalTimeZone()))
}

// HANDLERS
const handlePosterUpload = (index: number, files: any) => {
  if (!files || (Array.isArray(files) && files.length === 0)) return
  const file = Array.isArray(files) ? files[0] : files

  if (!(file instanceof Blob)) {
    console.error('Objek yang diupload bukan merupakan File/Blob valid')
    return
  }

  const target = form.candidate[index]

  if (target?.poster && target.poster.startsWith('blob:')) {
    URL.revokeObjectURL(target.poster)
  }

  const newUrl = URL.createObjectURL(file)
  form.candidate[index] = {
    ...target,
    poster: newUrl
  }
}

const nextStep = async () => {
  if (!form.title || !form.shown || !form.date) {
    console.warn('Field Step 1 belum lengkap')
    return
  }
  stepper.value?.next()
}

const openAddModal = () => {
  resetForm()
  mode.value = 'add'
  isOpen.value = true
}

const openResultModal = (row: any) => {
  dataResult.value = row
  isOpenResult.value = true
}

const openEditModal = (row: any) => {
  mode.value = 'edit'
  editingIndex.value = dataEVoting.value.indexOf(row)

  Object.assign(form, JSON.parse(JSON.stringify(row)))
  dateObject.value = toUIFormat(row.date)

  const [h, m] = row.time.split(':').map(Number)
  timeObject.value = new Time(h, m)

  isOpen.value = true
}

const confirmDelete = async (row: any) => {
  const ok = await confirm({
    title: 'Hapus Data Voting?',
    description: `Hapus "${row.title}"?`,
    confirmLabel: 'Hapus',
    color: 'error'
  })
  if (ok) {
    const idx = dataEVoting.value.indexOf(row)
    dataEVoting.value.splice(idx, 1)
  }
}

const resetForm = () => {
  Object.assign(form, {
    title: '',
    shown: 'Semua RT',
    date: '',
    time: '00:00',
    image: '',
    candidate: [
      { name: '', vision: '', poster: '' },
      { name: '', vision: '', poster: '' }
    ]
  })
  dateObject.value = toCalendarDate(today(getLocalTimeZone()))
  timeObject.value = new Time(0, 0)
  fileUpload.value = []
}

const clearImage = () => {
  if (form.image?.startsWith('blob:')) URL.revokeObjectURL(form.image)
  form.image = ''
  fileUpload.value = []
}

// WATCHERS
watch(fileUpload, (newFiles) => {
  if (newFiles?.length > 0) {
    if (form.image?.startsWith('blob:')) URL.revokeObjectURL(form.image)
    form.image = URL.createObjectURL(newFiles[0])
  }
})

watch(
  [dateObject, timeObject],
  () => {
    form.date = dateObject.value.toString()
    form.time = timeObject.value.toString().slice(0, 5)
  },
  { immediate: true }
)

const saveData = async () => {
  const payload = {
    ...JSON.parse(JSON.stringify(form)),
    vote: mode.value === 'add' ? 0 : form.vote || 0,
    vote_yet: mode.value === 'add' ? 0 : form.vote_yet || 0
  }

  if (mode.value === 'add') {
    dataEVoting.value.unshift(payload)
  } else if (editingIndex.value !== null) {
    dataEVoting.value[editingIndex.value] = payload
  }

  isOpen.value = false
  resetForm()
}

const eVotingTable = [
  { accessorKey: 'title', header: 'Judul Voting' },
  { accessorKey: 'shown', header: 'Ditujukan Pada' },
  { accessorKey: 'date', header: 'Batas Voting' },
  { accessorKey: 'vote', header: 'Sudah Memilih' },
  { accessorKey: 'action', header: 'Aksi' }
]

const eVotingDoneTable = [
  { accessorKey: 'title', header: 'Judul Voting' },
  { accessorKey: 'selected_candidate', header: 'Kandidat Terpilih' },
  { accessorKey: 'vote', header: 'Sudah Memilih' },
  { accessorKey: 'vote_yet', header: 'Belum Memilih' },
  { accessorKey: 'action', header: 'Aksi' }
]

const data = computed(() => [
  {
    name: 'Supriadi',
    total: 60
  },
  {
    name: 'Supriadi 2',
    total: 55
  }
])
const x = (d: any, i: number) => i
const y = (d: any) => d.vote
const label = (d: any) => d.name

const pagination = ref({ pageIndex: 0, pageSize: 5 })
</script>

<template>
  <div>
    <ConfirmDialog />

    <div class="mb-6 flex justify-between items-center">
      <USelect v-model="selectedRT" :items="rtItems" class="w-48" />
      <UButton
        color="primary"
        icon="i-lucide-plus-circle"
        @click="openAddModal"
      >
        Tambah E-Voting
      </UButton>
    </div>

    <UModal v-model:open="isOpen" :ui="{ content: 'max-w-2xl' }">
      <template #header>
        <h3 class="text-lg font-semibold">
          {{ mode === 'add' ? 'Tambah' : 'Edit' }} E-Voting
        </h3>
      </template>

      <template #body>
        <UForm
          ref="formRef"
          :schema="EVotingFormSchema"
          :state="form"
          class="space-y-4"
          @submit="saveData"
        >
          <UStepper
            ref="stepper"
            :items="[
              { title: 'Informasi Umum', slot: 'one' },
              { title: 'Kandidat', slot: 'two' }
            ]"
          >
            <template #one>
              <div class="space-y-4 pt-4">
                <UFormField name="title" label="Judul Voting" required>
                  <UInput
                    v-model="form.title"
                    placeholder="Contoh: Pemilihan Ketua Karang Taruna"
                  />
                </UFormField>

                <UFormField name="shown" label="Target Wilayah">
                  <USelect
                    v-model="form.shown"
                    :items="rtItems"
                    class="w-full"
                  />
                </UFormField>

                <div class="grid grid-cols-2 gap-4">
                  <UFormField name="date" label="Batas Tanggal">
                    <UPopover>
                      <UButton
                        color="neutral"
                        variant="subtle"
                        icon="i-lucide-calendar"
                        class="w-full justify-start"
                      >
                        {{
                          format(
                            new Date(dateObject.toString()),
                            'dd MMMM yyyy'
                          )
                        }}
                      </UButton>
                      <template #content>
                        <UCalendar v-model="dateObject" />
                      </template>
                    </UPopover>
                  </UFormField>

                  <UFormField name="time" label="Jam Selesai">
                    <UInputTime v-model="timeObject" />
                  </UFormField>
                </div>

                <UFormField label="Banner Voting">
                  <div
                    v-if="form.image"
                    class="relative aspect-video rounded-lg overflow-hidden border"
                  >
                    <img
                      :src="form.image"
                      class="w-full h-full object-cover aspect-video"
                    />
                    <div
                      class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition"
                    >
                      <UButton
                        color="error"
                        size="xs"
                        icon="i-lucide-trash-2"
                        @click="clearImage"
                        >Hapus Gambar</UButton
                      >
                    </div>
                  </div>
                  <UFileUpload
                    v-else
                    v-model="fileUpload"
                    accept="image/*"
                    class="aspect-video"
                  />
                </UFormField>
              </div>

              <div class="flex justify-end mt-6">
                <UButton
                  label="Lanjut ke Kandidat"
                  trailing-icon="i-lucide-arrow-right"
                  @click="nextStep"
                />
              </div>
            </template>

            <template #two>
              <div class="space-y-4 pt-4">
                <div
                  v-for="(c, index) in form.candidate"
                  :key="index"
                  class="p-4 border rounded-xl bg-gray-50 space-y-3 relative"
                >
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-bold text-gray-500"
                      >Kandidat #{{ index + 1 }}</span
                    >
                    <UButton
                      v-if="form.candidate.length > 2"
                      icon="i-lucide-trash"
                      color="error"
                      variant="ghost"
                      size="xs"
                      @click="form.candidate.splice(index, 1)"
                    />
                  </div>

                  <div class="grid grid-cols-12 gap-3">
                    <UFormField
                      class="col-span-12 md:col-span-4"
                      label="Nama Lengkap"
                    >
                      <UInput v-model="c.name" />
                    </UFormField>
                    <UFormField
                      class="col-span-12 md:col-span-4"
                      label="Visi/Misi"
                    >
                      <UInput v-model="c.vision" />
                    </UFormField>
                    <UFormField
                      class="col-span-12 md:col-span-4"
                      label="Poster"
                    >
                      <UFileUpload
                        accept="image/*"
                        @update:model-value="
                          (f) => handlePosterUpload(index, f)
                        "
                      >
                        <template #default="{ open }">
                          <UButton
                            :color="
                              form.candidate[index].poster ? 'success' : ''
                            "
                            label="Upload Poster"
                            icon="i-lucide-image"
                            @click="open"
                          />
                        </template>
                      </UFileUpload>
                    </UFormField>
                    <img
                      v-if="form.candidate[index].poster"
                      class="col-span-12 object-cover aspect-video"
                      :src="form.candidate[index].poster"
                      :alt="`candidate-${index}`"
                    />
                  </div>
                </div>

                <UButton
                  variant="ghost"
                  block
                  icon="i-lucide-plus"
                  @click="
                    form.candidate.push({ name: '', vision: '', poster: '' })
                  "
                >
                  Tambah Kandidat
                </UButton>

                <div class="flex justify-between mt-6">
                  <UButton
                    variant="outline"
                    label="Kembali"
                    @click="stepper?.prev()"
                  />
                  <UButton
                    type="submit"
                    color="primary"
                    label="Simpan Voting"
                  />
                </div>
              </div>
            </template>
          </UStepper>
        </UForm>
      </template>
    </UModal>

    <UModal v-model:open="isOpenResult" :ui="{ content: 'max-w-2xl' }">
      <template #body>
        <EVotingResult />
      </template>
    </UModal>

    <UTabs
      :items="[
        { label: 'Berjalan', slot: 'berjalan' },
        { label: 'Selesai', slot: 'selesai' }
      ]"
      variant="link"
      class="mb-6 w-full"
      :ui="{
        label: 'text-md group-data-[state=inactive]:text-black w-20',
        indicator: 'h-1 bg-primary-600',
        list: 'px-0'
      }"
    >
      <template #berjalan>
        <UTable
          ref="table"
          v-model:pagination="pagination"
          :data="dataEVoting"
          :columns="eVotingTable"
          :pagination-options="{
            getPaginationRowModel: getPaginationRowModel()
          }"
        >
          <template #date-cell="{ row }">
            <span class="font-medium">{{
              format(new Date(row.original.date), 'dd MMM yyyy')
            }}</span>
            <div class="text-xs text-gray-400">{{ row.original.time }} WIB</div>
          </template>

          <template #action-cell="{ row }">
            <div class="flex gap-2">
              <UButton
                icon="i-lucide-pencil"
                variant="ghost"
                color="error"
                @click="openEditModal(row.original)"
              />
              <UButton
                icon="i-lucide-trash-2"
                variant="ghost"
                color="error"
                @click="confirmDelete(row.original)"
              />
            </div>
          </template>
        </UTable>
      </template>
      <template #selesai>
        <UTable
          ref="table"
          v-model:pagination="pagination"
          :data="dataEVotingDone"
          :columns="eVotingDoneTable"
          :pagination-options="{
            getPaginationRowModel: getPaginationRowModel()
          }"
        >
          <template #action-cell="{ row }">
            <div class="flex gap-2">
              <UButton
                icon="i-lucide-eye"
                variant="ghost"
                color="error"
                @click="openResultModal(row.original)"
              />
            </div>
          </template>
        </UTable>
      </template>
    </UTabs>
  </div>
</template>

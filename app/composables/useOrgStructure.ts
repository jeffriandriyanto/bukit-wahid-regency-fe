import { nanoid } from 'nanoid'
import { z } from 'zod'
import type { OrgNode, Scope, Mode } from '~/types/org'

/* =========================
  ZOD SCHEMA
========================= */
export const orgFormSchema = z.object({
  level: z.enum(['Dibawah', 'Setara']),
  rt: z.string().optional(),
  title: z.string().min(1, 'Jabatan wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  address: z.string().min(1, 'Alamat wajib diisi')
}).superRefine((data) => {
  // RT is required only when used in RT scope
  if (!data.rt) return
})

export type OrgFormSchema = z.infer<typeof orgFormSchema>

export const useOrgStructure = () => {
  /* =========================
    STATE
  ========================= */
  const isOpen = ref(false)
  const scope = ref<Scope>('rw')
  const mode = ref<Mode>('add')
  const editingNodeId = ref<string | null>(null)

  const selectedRT = ref('RT 01')
  const rtItems = ['RT 01', 'RT 02', 'RT 03', 'RT 04']
  const StructureItems = ['Dibawah', 'Setara']

  /* =========================
    FORM STATE
  ========================= */
  const form = reactive<OrgFormSchema>({
    level: 'Dibawah',
    rt: undefined,
    title: '',
    name: '',
    address: ''
  })

  const resetForm = () => {
    form.level = 'Dibawah'
    form.rt = ''
    form.title = ''
    form.name = ''
    form.address = ''
    editingNodeId.value = null
  }

  /* =========================
    DATA
  ========================= */
  const rwData = reactive<OrgNode>({
    id: 'rw-root',
    title: 'Ketua RW',
    name: 'Budi Santoso',
    address: 'RW 09',
    children: [
      {
        id: 'rw-wakil',
        title: 'Wakil Ketua RW',
        name: 'Andi Pratama',
        address: 'RW 09',
        children: []
      },
      {
        id: 'rw-wakil-2',
        title: 'Wakil Ketua 2 RW',
        name: 'Andi Pratama 2',
        address: 'RW 09',
        children: []
      },
      {
        id: 'rw-sekretaris',
        title: 'Sekretaris RW',
        name: 'Siti Rahmawati',
        address: 'RW 09',
        children: [
          {
            id: 'rw-sekretaris-1',
            title: 'Seksi Administrasi',
            name: 'Dewi Lestari',
            address: 'RW 09',
            children: []
          },
          {
            id: 'rw-sekretaris-2',
            title: 'Seksi Arsip',
            name: 'Rizky Maulana',
            address: 'RW 09',
            children: []
          }
        ]
      },
      {
        id: 'rw-bendahara',
        title: 'Bendahara RW',
        name: 'Agus Salim',
        address: 'RW 09',
        children: []
      }
    ]
  })

  const rtDataMap = reactive<Record<string, OrgNode>>({
    'RT 01': { id: 'rt01-root', title: 'Ketua RT', name: 'Rudi Hartono', address: 'RT 01', children: [] },
    'RT 02': { id: 'rt02-root', title: 'Ketua RT', name: 'Slamet Riyadi', address: 'RT 02', children: [] },
    'RT 03': { id: 'rt03-root', title: 'Ketua RT', name: 'Andi Saputra', address: 'RT 03', children: [] },
    'RT 04': { id: 'rt04-root', title: 'Ketua RT', name: 'Joko Susilo', address: 'RT 04', children: [] }
  })

  const currentRTData = computed(() => rtDataMap[selectedRT.value])

  /* =========================
    HELPERS
  ========================= */
  const findNodeById = (node: OrgNode, id: string): OrgNode | null => {
    if (node.id === id) return node
    for (const child of node.children || []) {
      const found = findNodeById(child, id)
      if (found) return found
    }
    return null
  }

  const removeNodeById = (node: OrgNode, id: string): boolean => {
    if (!node.children) return false
    const index = node.children.findIndex(c => c.id === id)
    if (index !== -1) {
      node.children.splice(index, 1)
      return true
    }
    return node.children.some(child => removeNodeById(child, id))
  }

  /* =========================
    ACTIONS
  ========================= */
  const openAddModal = (target: Scope) => {
    scope.value = target
    mode.value = 'add'
    resetForm()
    isOpen.value = true
  }

  const openEditModal = (target: Scope, node: OrgNode) => {
    scope.value = target
    mode.value = 'edit'
    editingNodeId.value = node.id

    form.title = node.title
    form.name = node.name
    form.address = node.address
    form.rt = target === 'rt' ? node.address : selectedRT.value

    isOpen.value = true
  }

  const saveData = (validated: OrgFormSchema) => {
    const root = scope.value === 'rw'
      ? rwData
      : rtDataMap[validated.rt || selectedRT.value]

    if (mode.value === 'edit' && editingNodeId.value) {
      const target = findNodeById(root, editingNodeId.value)
      if (!target) return
      Object.assign(target, validated)
    } else {
      const newNode: OrgNode = {
        id: nanoid(),
        title: validated.title,
        name: validated.name,
        address: validated.address
      }

      root.children ||= []

      validated.level === 'Setara'
        ? root.children.push(newNode)
        : root.children.unshift(newNode)
    }

    isOpen.value = false
  }

  const deleteNode = () => {
    if (!editingNodeId.value) return
    if (!confirm('Yakin ingin menghapus struktur ini?')) return

    const root = scope.value === 'rw'
      ? rwData
      : rtDataMap[form.rt || selectedRT.value]

    removeNodeById(root, editingNodeId.value)
    isOpen.value = false
  }

  return {
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
  }
}

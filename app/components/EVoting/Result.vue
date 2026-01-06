<script setup lang="ts">
import { VisXYContainer, VisGroupedBar, VisAxis, VisTooltip } from '@unovis/vue'

// Data Dummy sesuai formatmu
const data = computed(() => [
  { name: 'Supriadi', total: 60 },
  { name: 'Supriadi 2', total: 55 },
  { name: 'Indra Jaya', total: 30 }
])

// Konfigurasi Chart
// Kita gunakan index (i) sebagai X agar batang berjejer
const x = (_d: any, i: number) => i
const y = (d: any) => d.total

// Formatter untuk menampilkan nama kandidat di sumbu (Axis)
const xTicks = (i: number) => data.value[i]?.name

// Warna: Kita bisa buat dinamis atau statis
const color = (_d: any, i: number) => ['#3b82f6', '#10b981', '#f59e0b'][i % 3]

// Tooltip agar istrimu bisa melihat angka pasti saat hover
const template = (d: any) => `${d.name}: ${d.total} Suara`
</script>

<template>
  <div class="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
    <h3 class="text-lg font-bold mb-4 text-gray-800">Hasil Perolehan Suara Sementara</h3>

    <VisXYContainer :data="data" :height="300" :margin="{ bottom: 50 }">
      <VisGroupedBar
        :x="x"
        :y="y"
        :color="color"
        :rounded-corners="6"
        :bar-padding="0.2"
      />

      <VisAxis
        type="x"
        :tickFormat="xTicks"
        :numTicks="data.length"
      />

      <VisAxis
        type="y"
        label="Jumlah Suara"
      />
    </VisXYContainer>
  </div>
</template>

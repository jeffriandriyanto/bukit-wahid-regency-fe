<script setup lang="ts">
import { sub } from 'date-fns'

const range = shallowRef({
  start: sub(new Date(), { days: 14 }),
  end: new Date()
})
const period = ref('daily')
</script>

<template>
  <div class="bg-white flex flex-col gap-4">
    <HomeStats :period="period" :range="range" />
    <HomeChart :period="period" :range="range" />
    <HomeSales :period="period" :range="range" />
  </div>
</template>

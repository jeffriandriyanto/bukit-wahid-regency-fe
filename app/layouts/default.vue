<script setup lang="ts">
import { sidebarItems } from '~/const/sidebar'

const toast = useToast()
const open = ref(false)
const route = useRoute()

const displayName = computed(() => {
  if (!route.name) return ''

  const displayPath = route.name
    .toString()
    .replace(/-/g, ' ')

  return displayPath.charAt(0).toUpperCase() + displayPath.slice(1)
})

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') {
    return
  }

  toast.add({
    title:
      'We use first-party cookies to enhance your experience on our website.',
    duration: 0,
    close: false,
    actions: [
      {
        label: 'Accept',
        variant: 'outline',
        onClick: () => {
          cookie.value = 'accepted'
        }
      },
      {
        label: 'Opt out',
        variant: 'ghost'
      }
    ]
  })
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-neutral-900 text-white w-64"
    >
      <template #header>
        <AppLogoWhite class="w-auto mx-auto h-8 shrink-0" />
      </template>

      <template #default>
        <SidebarNav :items="sidebarItems" />
      </template>

      <template #footer>
        <span>v.1.0.0</span>
      </template>
    </UDashboardSidebar>

    <UMain class="bg-white w-full text-black">
      <UDashboardPanel
        id="home"
        :ui="{
          root: 'bg-neutral-100'
        }"
      >
        <template #header>
          <UDashboardNavbar
            title="Home"
            :ui="{ right: 'gap-3', root: 'border-b-0' }"
          >
            <template #left>
              <div class="text-xl font-semibold">
                {{ displayName }}
              </div>
            </template>
            <template #right>
              <button
                class="flex items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-neutral-100"
              >
                <div class="flex flex-col text-right leading-tight">
                  <span class="text-sm font-medium text-neutral-900">
                    Name User
                  </span>
                  <span class="text-xs text-neutral-500"> email@user.com </span>
                </div>

                <UAvatar
                  src="https://github.com/benjamincanac.png"
                  size="sm"
                />
              </button>
            </template>
          </UDashboardNavbar>
        </template>

        <template #body>
          <slot />
        </template>
      </UDashboardPanel>
    </UMain>
  </UDashboardGroup>
</template>

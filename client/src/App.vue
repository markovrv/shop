<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Бухгалтерский учет</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-theme-provider :theme="$vuetify.theme.global.current">
        <v-btn icon @click="toggleTheme">
          <v-icon>{{ $vuetify.theme.global.current.dark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
        </v-btn>
      </v-theme-provider>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item
          v-for="item in navItems"
          :key="item.id"
          :to="item.route"
          :active="isActiveRoute(item.id)"
          exact
        >
          <template v-slot:prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list>
        <v-list-item
          color="warning"
          @click="openSettingsModal"
        >
          <template v-slot:prepend>
            <v-icon>mdi-cog</v-icon>
          </template>
          <v-list-item-title>Параметры</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <RouterView />
      </v-container>
    </v-main>

    <!-- Snackbar для уведомлений -->
    <v-snackbar
      v-model="uiStore.snackbar.show"
      :type="uiStore.snackbar.type"
      :timeout="3000"
      top
    >
      {{ uiStore.snackbar.message }}
    </v-snackbar>

    <!-- Settings Modal -->
    <SettingsModal v-model="showSettings" />
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from './stores/ui.js'
import { useAccountsStore } from './stores/accounts.js'
import { useEntriesStore } from './stores/entries.js'
import { useTheme } from 'vuetify'
import SettingsModal from './components/SettingsModal.vue'

const drawer = ref(false)
const showSettings = ref(false)
const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const accountsStore = useAccountsStore()
const entriesStore = useEntriesStore()
const theme = useTheme()

const navItems = [
  { id: 'entries', title: 'Проводки', icon: 'mdi-book-multiple', route: '/entries' },
  { id: 'accounts', title: 'Счета', icon: 'mdi-file-document-multiple', route: '/accounts' },
  { id: 'balances', title: 'Остатки', icon: 'mdi-calculator', route: '/balances' }
]

const isActiveRoute = (routeId) => {
  return route.name === routeId || route.path.includes(routeId)
}

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

const openSettingsModal = () => {
  showSettings.value = true
}

onMounted(async () => {
  await accountsStore.fetchAccounts()
  await entriesStore.fetchEntries()
})
</script>

<style scoped>
/* Add any global styles here */
</style>

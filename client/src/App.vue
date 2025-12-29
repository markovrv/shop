<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer;"></v-app-bar-nav-icon>
      <v-toolbar-title>Домик</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-theme-provider :theme="$vuetify.theme.global.current">
        <v-btn icon @click="toggleTheme">
          <v-icon>{{ $vuetify.theme.global.current.dark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'
            }}</v-icon>
        </v-btn>
      </v-theme-provider>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <template v-if="isAuthenticated">
          <v-list-item v-for="item in navItems" :key="item.id" :to="item.route" :active="isActiveRoute(item.id)" exact>
            <template v-slot:prepend>
              <v-icon>{{ item.icon }}</v-icon>
            </template>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
      <v-divider v-if="isAuthenticated"></v-divider>
      <v-list>
        <v-list-item color="warning" @click="openSettingsModal">
          <template v-slot:prepend>
            <v-icon>mdi-cog</v-icon>
          </template>
          <v-list-item-title>Параметры</v-list-item-title>
        </v-list-item>
        <template v-if="isAuthenticated">
          <v-list-item color="error" @click="logout">
            <template v-slot:prepend>
              <v-icon>mdi-logout</v-icon>
            </template>
            <v-list-item-title>Выход</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <RouterView />
      </v-container>
    </v-main>

    <!-- Snackbar для уведомлений -->
    <v-snackbar v-model="uiStore.snackbar.show" :type="uiStore.snackbar.type" :timeout="3000" top>
      {{ uiStore.snackbar.message }}
    </v-snackbar>

    <!-- Settings Modal -->
    <SettingsModal v-model="showSettings" />

  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from './stores/ui.js'
import { useAccountsStore } from './stores/accounts.js'
import { useOwnersStore } from './stores/owners.js'
import { useEntriesStore } from './stores/entries.js'
import { useEmployeesStore } from './stores/employees.js'
import { useTheme } from 'vuetify'
import SettingsModal from './components/SettingsModal.vue'

const drawer = ref(false)
const showSettings = ref(false)
const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const accountsStore = useAccountsStore()
const entriesStore = useEntriesStore()
const ownersStore = useOwnersStore()
const employeesStore = useEmployeesStore()
const theme = useTheme()

const navItems = [
  { id: 'entries', title: 'Проводки', icon: 'mdi-book-multiple', route: '/entries' },
  { id: 'balances', title: 'Обороты', icon: 'mdi-calculator', route: '/balances' },
  { id: 'accounts', title: 'Счета', icon: 'mdi-file-document-multiple', route: '/accounts' },
  { id: 'owners', title: 'Владельцы', icon: 'mdi-account-tie', route: '/owners' },
  { id: 'employees', title: 'Сотрудники', icon: 'mdi-account-group', route: '/employees' },
]

const isAuthenticated = computed(() => {
  return uiStore.userLoginState
});

const isActiveRoute = (routeId) => {
  return route.name === routeId || route.path.includes(routeId)
}

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

const openSettingsModal = () => {
  showSettings.value = true
}

const logout = () => {
  sessionStorage.removeItem('token');
  router.push('/login'); // Перенаправляем на страницу входа
  uiStore.showSuccess('Вы вышли из системы', 'info');
  uiStore.setUserLoginState(false);
};

onMounted(async () => {
  await accountsStore.fetchAccounts()
  await entriesStore.fetchEntries()
  await ownersStore.fetchOwners()
  await employeesStore.fetchEmployees()
  if (sessionStorage.getItem('token')) {
    uiStore.setUserLoginState(true);
  } else {
    uiStore.setUserLoginState(false);
  }
})
</script>

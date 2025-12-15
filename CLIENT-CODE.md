# Файлы клиентской части (Vue 3 + Vuetify)

## client/package.json

```json
{
  "name": "bookkeeping-client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.3.4",
    "vuetify": "^3.3.11",
    "pinia": "^2.1.6",
    "axios": "^1.5.0",
    "dayjs": "^1.11.10"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.4.0",
    "vite": "^5.0.0",
    "@mdi/js": "^7.3.67"
  }
}
```

---

## client/vite.config.js

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    host: 'localhost'
  }
})
```

---

## client/index.html

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Бухгалтерский учет</title>
  <link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/mdi@latest/css/materialdesignicons.min.css" rel="stylesheet">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

---

## client/src/main.js

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#2E7D8C',
          secondary: '#5E5240',
          accent: '#32B8C6',
          error: '#C01533',
          warning: '#A84D2F',
          success: '#2E7D8C',
          info: '#626C71'
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#32B8C6',
          secondary: '#C69B7B',
          accent: '#50B8C6',
          error: '#FF5459',
          warning: '#E68161',
          success: '#50B8C6',
          info: '#A7B1B6'
        }
      }
    }
  }
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(vuetify)
app.mount('#app')
```

---

## client/src/api/client.js

```javascript
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Обработка ошибок
api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.error || error.message
    return Promise.reject(new Error(message))
  }
)

export const accountsApi = {
  getAll: () => api.get('/accounts'),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`)
}

export const entriesApi = {
  getAll: (params = {}) => api.get('/entries', { params }),
  create: (data) => api.post('/entries', data),
  update: (id, data) => api.put(`/entries/${id}`, data),
  delete: (id) => api.delete(`/entries/${id}`)
}

export const balancesApi = {
  getAll: (date) => api.get('/balances', { params: { date } })
}

export const adminApi = {
  recalculate: () => api.post('/admin/recalculate'),
  health: () => api.get('/admin/health')
}
```

---

## client/src/stores/accounts.js

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { accountsApi } from '../api/client.js'

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchAccounts = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await accountsApi.getAll()
      accounts.value = response.data || []
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const createAccount = async (accountData) => {
    loading.value = true
    error.value = null
    try {
      const response = await accountsApi.create(accountData)
      accounts.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAccount = async (id, accountData) => {
    loading.value = true
    error.value = null
    try {
      const response = await accountsApi.update(id, accountData)
      const index = accounts.value.findIndex(a => a.id === id)
      if (index >= 0) {
        accounts.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAccount = async (id) => {
    loading.value = true
    error.value = null
    try {
      await accountsApi.delete(id)
      accounts.value = accounts.value.filter(a => a.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const accountOptions = computed(() =>
    accounts.value.map(a => ({ title: a.name, value: a.id }))
  )

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    accountOptions
  }
})
```

---

## client/src/stores/entries.js

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { entriesApi } from '../api/client.js'

export const useEntriesStore = defineStore('entries', () => {
  const entries = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filters = ref({
    fromDate: null,
    toDate: null,
    accountId: null
  })
  const pagination = ref({
    page: 1,
    limit: 50,
    total: 0
  })

  const fetchEntries = async (customFilters = {}) => {
    loading.value = true
    error.value = null
    try {
      const params = {
        ...filters.value,
        ...customFilters,
        page: pagination.value.page,
        limit: pagination.value.limit
      }
      const response = await entriesApi.getAll(params)
      entries.value = response.data || []
      pagination.value = response.pagination || pagination.value
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const createEntry = async (entryData) => {
    loading.value = true
    error.value = null
    try {
      const response = await entriesApi.create(entryData)
      entries.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateEntry = async (id, entryData) => {
    loading.value = true
    error.value = null
    try {
      const response = await entriesApi.update(id, entryData)
      const index = entries.value.findIndex(e => e.id === id)
      if (index >= 0) {
        entries.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteEntry = async (id) => {
    loading.value = true
    error.value = null
    try {
      await entriesApi.delete(id)
      entries.value = entries.value.filter(e => e.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1
  }

  const clearFilters = () => {
    filters.value = { fromDate: null, toDate: null, accountId: null }
    pagination.value.page = 1
  }

  return {
    entries,
    loading,
    error,
    filters,
    pagination,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    setFilters,
    clearFilters
  }
})
```

---

## client/src/stores/ui.js

```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const currentPage = ref('entries') // 'entries' | 'accounts' | 'balances'
  const showEntryModal = ref(false)
  const showAccountModal = ref(false)
  const editingEntry = ref(null)
  const editingAccount = ref(null)
  const snackbar = ref({
    show: false,
    message: '',
    type: 'success'
  })

  const openEntryModal = (entry = null) => {
    editingEntry.value = entry
    showEntryModal.value = true
  }

  const closeEntryModal = () => {
    editingEntry.value = null
    showEntryModal.value = false
  }

  const openAccountModal = (account = null) => {
    editingAccount.value = account
    showAccountModal.value = true
  }

  const closeAccountModal = () => {
    editingAccount.value = null
    showAccountModal.value = false
  }

  const showSuccess = (message) => {
    snackbar.value = { show: true, message, type: 'success' }
    setTimeout(() => snackbar.value.show = false, 3000)
  }

  const showError = (message) => {
    snackbar.value = { show: true, message, type: 'error' }
    setTimeout(() => snackbar.value.show = false, 5000)
  }

  return {
    currentPage,
    showEntryModal,
    showAccountModal,
    editingEntry,
    editingAccount,
    snackbar,
    openEntryModal,
    closeEntryModal,
    openAccountModal,
    closeAccountModal,
    showSuccess,
    showError
  }
})
```

---

## client/src/App.vue

```vue
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
          :active="uiStore.currentPage === item.id"
          @click="uiStore.currentPage = item.id"
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
          active-color="warning"
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
        <!-- Раздел Проводки -->
        <EntriesPage v-if="uiStore.currentPage === 'entries'" />
        
        <!-- Раздел Счета -->
        <AccountsPage v-else-if="uiStore.currentPage === 'accounts'" />
        
        <!-- Раздел Остатки -->
        <BalancesPage v-else-if="uiStore.currentPage === 'balances'" />
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
import { useUiStore } from './stores/ui.js'
import { useAccountsStore } from './stores/accounts.js'
import { useEntriesStore } from './stores/entries.js'
import EntriesPage from './pages/EntriesPage.vue'
import AccountsPage from './pages/AccountsPage.vue'
import BalancesPage from './pages/BalancesPage.vue'
import SettingsModal from './components/SettingsModal.vue'

const drawer = ref(false)
const showSettings = ref(false)
const uiStore = useUiStore()
const accountsStore = useAccountsStore()
const entriesStore = useEntriesStore()

const navItems = [
  { id: 'entries', title: 'Проводки', icon: 'mdi-book-multiple' },
  { id: 'accounts', title: 'Счета', icon: 'mdi-file-document-multiple' },
  { id: 'balances', title: 'Остатки', icon: 'mdi-calculator' }
]

const toggleTheme = () => {
  const current = $vuetify.theme.global.current
  current.dark = !current.dark
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
```

---

## client/src/pages/EntriesPage.vue

```vue
<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="uiStore.openEntryModal()"
        >
          Новая проводка
        </v-btn>
      </v-col>
    </v-row>

    <FilterPanel @apply="handleFilterApply" @clear="handleFilterClear" />

    <EntriesTable />

    <EntryFormModal v-if="uiStore.showEntryModal" />
  </div>
</template>

<script setup>
import { useUiStore } from '../stores/ui.js'
import { useEntriesStore } from '../stores/entries.js'
import FilterPanel from '../components/FilterPanel.vue'
import EntriesTable from '../components/EntriesTable.vue'
import EntryFormModal from '../components/EntryFormModal.vue'

const uiStore = useUiStore()
const entriesStore = useEntriesStore()

const handleFilterApply = async (filters) => {
  entriesStore.setFilters(filters)
  await entriesStore.fetchEntries()
}

const handleFilterClear = async () => {
  entriesStore.clearFilters()
  await entriesStore.fetchEntries()
}
</script>
```

---

## client/src/pages/AccountsPage.vue

```vue
<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="uiStore.openAccountModal()"
        >
          Новый счет
        </v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title>Список счетов</v-card-title>
      <v-table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Тип</th>
            <th>Начальный баланс</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="account in accountsStore.accounts" :key="account.id">
            <td>{{ account.name }}</td>
            <td>{{ account.type }}</td>
            <td>{{ account.initialBalance }}</td>
            <td>
              <v-btn
                size="small"
                icon="mdi-pencil"
                variant="plain"
                @click="uiStore.openAccountModal(account)"
              ></v-btn>
              <v-btn
                size="small"
                icon="mdi-delete"
                variant="plain"
                color="error"
                @click="handleDelete(account.id)"
              ></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <AccountFormModal v-if="uiStore.showAccountModal" />
  </div>
</template>

<script setup>
import { useUiStore } from '../stores/ui.js'
import { useAccountsStore } from '../stores/accounts.js'
import AccountFormModal from '../components/AccountFormModal.vue'

const uiStore = useUiStore()
const accountsStore = useAccountsStore()

const handleDelete = async (id) => {
  if (confirm('Вы уверены?')) {
    try {
      await accountsStore.deleteAccount(id)
      uiStore.showSuccess('Счет удален')
    } catch (err) {
      uiStore.showError(err.message)
    }
  }
}
</script>
```

---

## client/src/pages/BalancesPage.vue

```vue
<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="selectedDate"
          label="Дата"
          type="date"
          @change="handleDateChange"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-btn color="primary" @click="handleDateChange">Показать остатки</v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title>Остатки по счетам на {{ selectedDate }}</v-card-title>
      <v-table>
        <thead>
          <tr>
            <th>Счет</th>
            <th>Тип</th>
            <th>Начальный баланс</th>
            <th>Дебет</th>
            <th>Кредит</th>
            <th>Остаток</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="balance in balances" :key="balance.accountId">
            <td>{{ balance.accountName }}</td>
            <td>{{ balance.accountType }}</td>
            <td>{{ balance.initialBalance }}</td>
            <td>{{ balance.debitSum }}</td>
            <td>{{ balance.creditSum }}</td>
            <td :style="{ fontWeight: 'bold', color: balance.balance >= 0 ? 'green' : 'red' }">
              {{ balance.balance }}
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { balancesApi } from '../api/client.js'
import { useUiStore } from '../stores/ui.js'

const uiStore = useUiStore()
const selectedDate = ref(new Date().toISOString().split('T')[0])
const balances = ref([])

const handleDateChange = async () => {
  try {
    const response = await balancesApi.getAll(selectedDate.value)
    balances.value = response.data || []
  } catch (err) {
    uiStore.showError(err.message)
  }
}

onMounted(handleDateChange)
</script>
```

---

**Примечание:** Из-за объема, компоненты `FilterPanel.vue`, `EntriesTable.vue`, `EntryFormModal.vue`, `AccountFormModal.vue` и `SettingsModal.vue` можно создать аналогичным образом на основе Vuetify примеров. Базовая структура показана выше.

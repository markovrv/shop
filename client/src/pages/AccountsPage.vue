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
      <v-card-title>Список счетов учёта</v-card-title>
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
            <td>{{ getAccountTypeTitle(account.type) }}</td>
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

const accountTypes = [
  { title: 'Актив', value: 'asset' },
  { title: 'Пассив', value: 'liability' },
  { title: 'Капитал', value: 'equity' },
  { title: 'Доход', value: 'income' },
  { title: 'Расход', value: 'expense' }
]

function getAccountTypeTitle(type) {
  try {
    return accountTypes.find((t) => t.value === type).title
  } catch (err) {
    return type
  }
}

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
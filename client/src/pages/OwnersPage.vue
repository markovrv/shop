<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="uiStore.openOwnerModal()"
        >
          Новый владелец
        </v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title>Список владельцев и их счета учёта</v-card-title>

      <v-table>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Банк</th>
            <th>Касса</th>
            <th>Выручка</th>
            <th>Личный</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="owner in ownersStore.owners" :key="owner.id">
            <td>{{ owner.name }}</td>
            <td>{{ accountsStore.getAccountById(owner.bank_account_id) }}</td>
            <td>{{ accountsStore.getAccountById(owner.cash_account_id) }}</td>
            <td>{{ accountsStore.getAccountById(owner.revenue_account_id) }}</td>
            <td>{{ accountsStore.getAccountById(owner.personal_account_id) }}</td>
            <td>
              <v-btn
                size="small"
                icon="mdi-pencil"
                variant="plain"
                @click="uiStore.openOwnerModal(owner)"
              ></v-btn>
              <v-btn
                size="small"
                icon="mdi-delete"
                variant="plain"
                color="error"
                @click="handleDelete(owner.id)"
              ></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <OwnerFormModal v-if="uiStore.showOwnerModal" />
  </div>
</template>

<script setup>
import { useUiStore } from '../stores/ui.js'
import { useOwnersStore } from '../stores/owners.js'
import { useAccountsStore } from '../stores/accounts.js'
import OwnerFormModal from '../components/OwnerFormModal.vue'

const uiStore = useUiStore()
const ownersStore = useOwnersStore()
const accountsStore = useAccountsStore()

const handleDelete = async (id) => {
  if (confirm('Вы уверены?')) {
    try {
      await ownersStore.deleteOwner(id)
      uiStore.showSuccess('Владелец удален')
    } catch (err) {
      uiStore.showError(err.message)
    }
  }
}
</script>
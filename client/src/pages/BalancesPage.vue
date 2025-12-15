<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="startDate"
          label="Дата начала"
          type="date"
          @change="handleDateChange"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="endDate"
          label="Дата окончания"
          type="date"
          @change="handleDateChange"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-btn color="primary" @click="handleDateChange">Показать остатки</v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title>Остатки по счетам за период с {{ startDate }} по {{ endDate }}</v-card-title>
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
            <td>{{ getAccountTypeTitle(balance.accountType) }}</td>
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
const startDate = ref('2000-01-01')
const endDate = ref(new Date().toISOString().split('T')[0])
const balances = ref([])

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

const handleDateChange = async () => {
  try {
    const response = await balancesApi.getAll(startDate.value, endDate.value)
    balances.value = response.data || []
  } catch (err) {
    uiStore.showError(err.message)
  }
}

onMounted(handleDateChange)
</script>
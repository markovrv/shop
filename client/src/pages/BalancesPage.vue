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
        <v-btn color="primary" @click="handleDateChange">Показать обороты</v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title>Обороты по счетам за период с {{ startDate }} по {{ endDate }}</v-card-title>
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
            <td><span v-html="formatCurrency(getAdjustedInitialBalance(balance))"></span></td>
            <td><span v-html="formatCurrency(balance.debitSum)"></span></td>
            <td><span v-html="formatCurrency(balance.creditSum)"></span></td>
            <td :style="{ fontWeight: 'bold', color: balance.balance >= 0 ? 'green' : 'red' }">
              <span v-html="formatCurrency(balance.balance)"></span>
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

// Функция форматирования валюты для отображения с копейками
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '';
  
  const number = parseFloat(amount);
  if (isNaN(number)) return '';
  
  // Разделяем целую и дробную части
  const [integerPart, decimalPart] = number.toFixed(2).split('.');
  
  // Если дробная часть равна 00, не отображаем копейки
  if (decimalPart === '00') {
    return new Intl.NumberFormat('ru-RU').format(parseInt(integerPart));
  }
  
  // Иначе форматируем с выделением копеек
  const formattedInteger = new Intl.NumberFormat('ru-RU').format(parseInt(integerPart));
  return `${formattedInteger}<span class="kopecks">.${decimalPart}</span>`;
}

const handleDateChange = async () => {
  try {
    const response = await balancesApi.getAll(startDate.value, endDate.value)
    balances.value = response.data || []
  } catch (err) {
    uiStore.showError(err.message)
  }
}

// Функция для расчета скорректированного начального баланса в зависимости от типа счета
const getAdjustedInitialBalance = (balance) => {
  switch (balance.accountType) {
    case 'asset': // Для активов: initialBalance = initialBalance + дебет до периода - кредит до периода
      return balance.initialBalance + (balance.debitBefore || 0) - (balance.creditBefore || 0);
    case 'liability': // Для пассивов: initialBalance = initialBalance + кредит до периода - дебет до периода
    case 'equity':   // Для капитала: initialBalance = initialBalance + кредит до периода - дебет до периода
      return balance.initialBalance + (balance.creditBefore || 0) - (balance.debitBefore || 0);
    case 'income': // Для доходов: initialBalance = оборот по кредиту до периода (показывает только оборот)
      return balance.creditBefore || 0;
    case 'expense': // Для расходов: initialBalance = оборот по дебету до периода (показывает только оборот)
      return balance.debitBefore || 0;
    default:
      return 0;
  }
}

onMounted(handleDateChange)
</script>
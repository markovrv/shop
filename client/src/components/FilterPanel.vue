<template>
  <v-card class="mb-4">
    <v-card-title>Фильтры</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="localFilters.fromDate"
            label="Дата от"
            type="date"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="localFilters.toDate"
            label="Дата до"
            type="date"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="localFilters.documentNumber"
            label="Номер документа"
            clearable
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="localFilters.accountId"
            :items="accountsStore.accountOptions"
            item-title="title"
            item-value="value"
            label="Счет"
            clearable
          ></v-select>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="applyFilters">Применить</v-btn>
      <v-btn @click="clearFilters">Очистить</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAccountsStore } from '../stores/accounts.js'

const accountsStore = useAccountsStore()

// Инициализируем с пустыми значениями, чтобы не было конфликта с родительскими значениями
const localFilters = ref({
  fromDate: null,
  toDate: null,
  accountId: null,
  documentNumber: ''
})

// Загружаем счета при создании компонента
accountsStore.fetchAccounts()

const emit = defineEmits(['apply', 'clear'])

const applyFilters = () => {
  emit('apply', { ...localFilters.value })
}

const clearFilters = () => {
  localFilters.value = {
    fromDate: null,
    toDate: null,
    accountId: null,
    documentNumber: ''
  }
  emit('clear')
}

// Следим за изменениями фильтров и обновляем локальные значения
watch(() => accountsStore.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true, immediate: true })
</script>
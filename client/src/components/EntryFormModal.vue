<template>
  <v-dialog v-model="uiStore.showEntryModal" max-width="600">
    <v-card>
      <v-card-title>{{ uiStore.editingEntry ? 'Редактировать проводку' : 'Новая проводка' }}</v-card-title>
      <v-card-text>
        <v-form ref="formRef">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.date"
                label="Дата"
                type="date"
                :rules="[required]"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="formData.description"
                label="Описание"
                :rules="[required]"
              ></v-textarea>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.debitAccountId"
                :items="accountsStore.accountOptions"
                item-title="title"
                item-value="value"
                label="Счет по дебету"
                :rules="[required]"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.creditAccountId"
                :items="accountsStore.accountOptions"
                item-title="title"
                item-value="value"
                label="Счет по кредиту"
                :rules="[required]"
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="formData.amount"
                label="Сумма"
                type="number"
                :rules="[required, positive]"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="closeModal">Отмена</v-btn>
        <v-btn color="primary" @click="saveEntry">Сохранить</v-btn>
      </v-card-actions>
    </v-card>
 </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useUiStore } from '../stores/ui.js'
import { useEntriesStore } from '../stores/entries.js'
import { useAccountsStore } from '../stores/accounts.js'

const uiStore = useUiStore()
const entriesStore = useEntriesStore()
const accountsStore = useAccountsStore()

const formRef = ref(null)

const formData = ref({
  date: new Date().toISOString().split('T')[0],
  description: '',
  debitAccountId: null,
  creditAccountId: null,
  amount: null
})

// Загружаем счета при создании компонента
accountsStore.fetchAccounts()

// Следим за изменениями в editingEntry
watch(() => uiStore.editingEntry, (newEntry) => {
  if (newEntry) {
    // Редактирование существующей проводки
    formData.value = {
      date: newEntry.date,
      description: newEntry.description,
      debitAccountId: newEntry.debitAccountId,
      creditAccountId: newEntry.creditAccountId,
      amount: newEntry.amount
    }
  } else {
    // Создание новой проводки
    formData.value = {
      date: new Date().toISOString().split('T')[0],
      description: '',
      debitAccountId: null,
      creditAccountId: null,
      amount: null
    }
 }
}, { immediate: true })

const required = (value) => {
  return !!value || 'Поле обязательно для заполнения'
}

const positive = (value) => {
  return (value && value > 0) || 'Сумма должна быть положительной'
}

const closeModal = () => {
 uiStore.closeEntryModal()
}

const saveEntry = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  formData.value.amount = parseInt(formData.value.amount)

  try {
    if (uiStore.editingEntry) {
      await entriesStore.updateEntry(uiStore.editingEntry.id, formData.value)
      uiStore.showSuccess('Проводка обновлена')
    } else {
      await entriesStore.createEntry(formData.value)
      uiStore.showSuccess('Проводка создана')
    }
    closeModal()
  } catch (err) {
    uiStore.showError(err.message)
  }
}
</script>
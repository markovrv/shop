<template>
  <v-dialog v-model="uiStore.showOwnerModal" max-width="600">
    <v-card>
      <v-card-title>{{ uiStore.editingOwner ? 'Редактировать владельца' : 'Новый владелец' }}</v-card-title>
      <v-card-text>
        <v-form ref="formRef">
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="formData.name" label="Имя" :rules="[required]"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select v-model="formData.bank_account_id" :items="accountsStore.accountOptions" item-title="title"
                item-value="value" label="Банковский счет" placeholder="Банковский счет" clearable
                class="mb-4"></v-select>
            </v-col>
            <v-col cols="6">
              <v-select v-model="formData.cash_account_id" :items="accountsStore.accountOptions" item-title="title"
                item-value="value" label="Касса (наличные)" placeholder="Касса (наличные)" clearable
                class="mb-4"></v-select>
            </v-col>
            <v-col cols="6">
              <v-select v-model="formData.revenue_account_id" :items="accountsStore.accountOptions" item-title="title"
                item-value="value" label="Счёт продаж (выручка)" placeholder="Счёт продаж (выручка)" clearable
                class="mb-4"></v-select>
            </v-col>
            <v-col cols="6">
              <v-select v-model="formData.personal_account_id" :items="accountsStore.accountOptions" item-title="title"
                item-value="value" label="Личный счёт" placeholder="Личный счёт" clearable class="mb-4"></v-select>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="formData.email" label="Email" :rules="[email]"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="formData.phone" label="Телефон"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="formData.notes" label="Заметки" rows="1"></v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="closeModal">Отмена</v-btn>
        <v-btn color="primary" @click="saveOwner">Сохранить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useUiStore } from '../stores/ui.js'
import { useOwnersStore } from '../stores/owners.js'
import { useAccountsStore } from '../stores/accounts.js'

const uiStore = useUiStore()
const ownersStore = useOwnersStore()
const accountsStore = useAccountsStore()

const formRef = ref(null)

const formData = ref({
  name: '',
  email: '',
  phone: '',
  notes: '',
  bank_account_id: null,
  cash_account_id: null,
  revenue_account_id: null,
  personal_account_id: null
})

// Следим за изменениями в editingOwner
watch(() => uiStore.editingOwner, (newOwner) => {
  if (newOwner) {
    // Редактирование существующего владельца
    formData.value = {
      name: newOwner.name,
      email: newOwner.email,
      phone: newOwner.phone,
      notes: newOwner.notes,
      bank_account_id: newOwner.bank_account_id,
      cash_account_id: newOwner.cash_account_id,
      revenue_account_id: newOwner.revenue_account_id,
      personal_account_id: newOwner.personal_account_id
    }
  } else {
    // Создание нового владельца
    formData.value = {
      name: '',
      email: '',
      phone: '',
      notes: '',
      bank_account_id: null,
      cash_account_id: null,
      revenue_account_id: null,
      personal_account_id: null
    }
  }
}, { immediate: true })

const required = (value) => {
  return !!value || 'Поле обязательно для заполнения'
}

const email = (value) => {
  if (!value) return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value) || 'Некорректный email'
}

const closeModal = () => {
  uiStore.closeOwnerModal()
}

const saveOwner = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    if (uiStore.editingOwner) {
      await ownersStore.updateOwner(uiStore.editingOwner.id, formData.value)
      uiStore.showSuccess('Владелец обновлен')
    } else {
      await ownersStore.createOwner(formData.value)
      uiStore.showSuccess('Владелец создан')
    }
    closeModal()
  } catch (err) {
    uiStore.showError(err.message)
  }
}
</script>

<style scoped>
  .v-col {
    padding: 0 6px;
  }
</style>
<template>
  <v-dialog v-model="uiStore.showAccountModal" max-width="600">
    <v-card>
      <v-card-title>{{ editingAccount ? 'Редактировать счет' : 'Новый счет' }}</v-card-title>
      <v-card-text>
        <v-form ref="formRef">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                label="Название"
                :rules="[required]"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="formData.type"
                :items="accountTypes"
                item-title="title"
                item-value="value"
                label="Тип"
                :rules="[required]"
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="formData.initialBalance"
                label="Начальный баланс"
                type="number"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="closeModal">Отмена</v-btn>
        <v-btn color="primary" @click="saveAccount">Сохранить</v-btn>
      </v-card-actions>
    </v-card>
 </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useUiStore } from '../stores/ui.js'
import { useAccountsStore } from '../stores/accounts.js'

const uiStore = useUiStore()
const accountsStore = useAccountsStore()

const formRef = ref(null)

const accountTypes = [
  { title: 'Актив', value: 'asset' },
  { title: 'Пассив', value: 'liability' },
  { title: 'Капитал', value: 'equity' },
  { title: 'Доход', value: 'income' },
  { title: 'Расход', value: 'expense' }
]

const formData = ref({
  name: '',
  type: 'asset',
  initialBalance: 0
})

// Следим за изменениями в editingAccount
watch(() => uiStore.editingAccount, (newAccount) => {
  if (newAccount) {
    // Редактирование существующего счета
    formData.value = {
      name: newAccount.name,
      type: newAccount.type,
      initialBalance: newAccount.initialBalance
    }
  } else {
    // Создание нового счета
    formData.value = {
      name: '',
      type: 'asset',
      initialBalance: 0
    }
  }
}, { immediate: true })

const required = (value) => {
 return !!value || 'Поле обязательно для заполнения'
}

const closeModal = () => {
  uiStore.closeAccountModal()
}

const saveAccount = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  formData.value.initialBalance = parseInt(formData.value.initialBalance) || 0

  try {
    if (uiStore.editingAccount) {
      await accountsStore.updateAccount(uiStore.editingAccount.id, formData.value)
      uiStore.showSuccess('Счет обновлен')
    } else {
      await accountsStore.createAccount(formData.value)
      uiStore.showSuccess('Счет создан')
    }
    closeModal()
 } catch (err) {
    uiStore.showError(err.message)
  }
}
</script>
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const userLoginState = ref(false)
  const showEntryModal = ref(false)
  const showAccountModal = ref(false)
  const editingEntry = ref(null)
  const editingAccount = ref(null)
  const snackbar = ref({
      show: false,
      message: '',
      type: 'success'
    })

  const setUserLoginState = (state) => {
    userLoginState.value = state
  }

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
    userLoginState,
    showEntryModal,
    showAccountModal,
    editingEntry,
    editingAccount,
    snackbar,
    setUserLoginState,
    openEntryModal,
    closeEntryModal,
    openAccountModal,
    closeAccountModal,
    showSuccess,
    showError
  }
})
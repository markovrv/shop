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

  const getAccountById = (id) => (accounts.value.find(a => a.id === id )?.name)

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    accountOptions,
    getAccountById
  }
})
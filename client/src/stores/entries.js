import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { entriesApi } from '../api/client.js'

export const useEntriesStore = defineStore('entries', () => {
 const entries = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filters = ref({
    fromDate: null,
    toDate: null,
    accountId: null
  })
  const pagination = ref({
    page: 1,
    limit: 50,
    total: 0
  })

  const fetchEntries = async (customFilters = {}) => {
    loading.value = true
    error.value = null
    try {
      const params = {
        ...filters.value,
        ...customFilters,
        page: pagination.value.page,
        limit: pagination.value.limit
      }
      const response = await entriesApi.getAll(params)
      entries.value = response.data || []
      pagination.value = response.pagination || pagination.value
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const createEntry = async (entryData) => {
    loading.value = true
    error.value = null
    try {
      const response = await entriesApi.create(entryData)
      entries.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateEntry = async (id, entryData) => {
    loading.value = true
    error.value = null
    try {
      const response = await entriesApi.update(id, entryData)
      const index = entries.value.findIndex(e => e.id === id)
      if (index >= 0) {
        entries.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteEntry = async (id) => {
    loading.value = true
    error.value = null
    try {
      await entriesApi.delete(id)
      entries.value = entries.value.filter(e => e.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1
  }

  const clearFilters = () => {
    filters.value = { fromDate: null, toDate: null, accountId: null }
    pagination.value.page = 1
  }

  return {
    entries,
    loading,
    error,
    filters,
    pagination,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    setFilters,
    clearFilters
  }
})
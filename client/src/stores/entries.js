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
    accountId: null,
    documentNumber: ''
  })
  const pagination = ref({
    page: 1,
    limit: 50,
    total: 0
  })
  
  const sortField = ref('date')
  const sortDirection = ref('asc')

  const fetchEntries = async (customFilters = {}) => {
    loading.value = true
    error.value = null
    try {
      // Преобразуем параметры фильтрации для соответствия API
      const apiParams = {
        ...customFilters,
        page: pagination.value.page,
        limit: pagination.value.limit,
        sortBy: sortField.value,
        sortOrder: sortDirection.value
      };
      
      // Добавляем фильтры, преобразуя documentNumber в document
      if (filters.value.fromDate) apiParams.fromDate = filters.value.fromDate;
      if (filters.value.toDate) apiParams.toDate = filters.value.toDate;
      if (filters.value.accountId) apiParams.accountId = filters.value.accountId;
      if (filters.value.documentNumber) apiParams.document = filters.value.documentNumber;
      
      const response = await entriesApi.getAll(apiParams)
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
    filters.value = { fromDate: null, toDate: null, accountId: null, documentNumber: '' }
    pagination.value.page = 1
  }

  return {
    entries,
    loading,
    error,
    filters,
    pagination,
    sortField,
    sortDirection,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    setFilters,
    clearFilters
  }
})
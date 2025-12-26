import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ownersApi } from '../api/client.js'

export const useOwnersStore = defineStore('owners', () => {
  const owners = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchOwners = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await ownersApi.getAll()
      owners.value = response.data || []
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const createOwner = async (ownerData) => {
    loading.value = true
    error.value = null
    try {
      const response = await ownersApi.create(ownerData)
      owners.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateOwner = async (id, ownerData) => {
    loading.value = true
    error.value = null
    try {
      const response = await ownersApi.update(id, ownerData)
      const index = owners.value.findIndex(a => a.id === id)
      if (index >= 0) {
        owners.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

 const deleteOwner = async (id) => {
    loading.value = true
    error.value = null
    try {
      await ownersApi.delete(id)
      owners.value = owners.value.filter(a => a.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const ownerOptions = computed(() =>
    owners.value.map(a => ({ title: a.name, value: a.id }))
  )

  return {
    owners,
    loading,
    error,
    fetchOwners,
    createOwner,
    updateOwner,
    deleteOwner,
    ownerOptions
  }
})
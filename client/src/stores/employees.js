import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { employeesApi } from '../api/client.js'

export const useEmployeesStore = defineStore('employees', () => {
  const employees = ref([])
 const loading = ref(false)
  const error = ref(null)

  const fetchEmployees = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await employeesApi.getAll()
      employees.value = response.data || []
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const createEmployee = async (employeeData) => {
    loading.value = true
    error.value = null
    try {
      const response = await employeesApi.create(employeeData)
      employees.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateEmployee = async (id, employeeData) => {
    loading.value = true
    error.value = null
    try {
      const response = await employeesApi.update(id, employeeData)
      const index = employees.value.findIndex(e => e.id === id)
      if (index >= 0) {
        employees.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteEmployee = async (id) => {
    loading.value = true
    error.value = null
    try {
      await employeesApi.delete(id)
      employees.value = employees.value.filter(e => e.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const employeeOptions = computed(() =>
    employees.value.map(e => ({ title: e.name, value: e.id }))
  )

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    employeeOptions
  }
})
<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="uiStore.openEmployeeModal()"
        >
          Новый сотрудник
        </v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title>Список сотрудников</v-card-title>

      <v-table>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Дневная зарплата</th>
            <th>Процент премии</th>
            <th>Счёт зарплаты</th>
            <th>Личный счёт</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in employeesStore.employees" :key="employee.id">
            <td>{{ employee.name }}</td>
            <td>{{ employee.daily_salary }}</td>
            <td>{{ employee.bonus_percentage }}%</td>
            <td>{{ accountsStore.getAccountById(employee.salary_account_id) }}</td>
            <td>{{ accountsStore.getAccountById(employee.personal_account_id) }}</td>
            <td>
              <v-btn
                size="small"
                icon="mdi-pencil"
                variant="plain"
                @click="uiStore.openEmployeeModal(employee)"
              ></v-btn>
              <v-btn
                size="small"
                icon="mdi-delete"
                variant="plain"
                color="error"
                @click="handleDelete(employee.id)"
              ></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <EmployeeFormModal v-if="uiStore.showEmployeeModal" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUiStore } from '../stores/ui.js'
import { useEmployeesStore } from '../stores/employees.js'
import { useAccountsStore } from '../stores/accounts.js'
import EmployeeFormModal from '../components/EmployeeFormModal.vue'

const uiStore = useUiStore()
const employeesStore = useEmployeesStore()
const accountsStore = useAccountsStore()

onMounted(async () => {
  await employeesStore.fetchEmployees()
  await accountsStore.fetchAccounts()
})

const handleDelete = async (id) => {
  if (confirm('Вы уверены?')) {
    try {
      await employeesStore.deleteEmployee(id)
      uiStore.showSuccess('Сотрудник удален')
    } catch (err) {
      uiStore.showError(err.message)
    }
  }
}
</script>
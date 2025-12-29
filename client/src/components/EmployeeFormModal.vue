<template>
    <v-dialog v-model="uiStore.showEmployeeModal" max-width="600">
        <v-card>
            <v-card-title>{{ uiStore.editingEmployee ? 'Редактировать сотрудника' : 'Новый сотрудник' }}</v-card-title>
            <v-card-text>
                <v-form ref="formRef">
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="formData.name" label="Имя" :rules="[required]"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model="formData.daily_salary" label="Дневная зарплата" type="number"
                                min="0"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model="formData.bonus_percentage" label="Процент премии" type="number"
                                min="0" max="100"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-select v-model="formData.salary_account_id" :items="accountsStore.accountOptions"
                                item-title="title" item-value="value" label="Счёт заработной платы"
                                placeholder="Счёт заработной платы" clearable class="mb-4"></v-select>
                        </v-col>
                        <v-col cols="6">
                            <v-select v-model="formData.personal_account_id" :items="accountsStore.accountOptions"
                                item-title="title" item-value="value" label="Личный счёт" placeholder="Личный счёт"
                                clearable class="mb-4"></v-select>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model="formData.phone" label="Телефон"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model="formData.email" label="Email" :rules="[email]"></v-text-field>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="closeModal">Отмена</v-btn>
                <v-btn color="primary" @click="saveEmployee">Сохранить</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useUiStore } from '../stores/ui.js'
import { useEmployeesStore } from '../stores/employees.js'
import { useAccountsStore } from '../stores/accounts.js'

const uiStore = useUiStore()
const employeesStore = useEmployeesStore()
const accountsStore = useAccountsStore()

const formRef = ref(null)

const formData = ref({
    name: '',
    phone: '',
    email: '',
    daily_salary: null,
    bonus_percentage: null,
    salary_account_id: null,
    personal_account_id: null
})

// Следим за изменениями в editingEmployee
watch(() => uiStore.editingEmployee, (newEmployee) => {
    if (newEmployee) {
        // Редактирование существующего сотрудника
        formData.value = {
            name: newEmployee.name,
            phone: newEmployee.phone,
            email: newEmployee.email,
            daily_salary: newEmployee.daily_salary,
            bonus_percentage: newEmployee.bonus_percentage,
            salary_account_id: newEmployee.salary_account_id,
            personal_account_id: newEmployee.personal_account_id
        }
    } else {
        // Создание нового сотрудника
        formData.value = {
            name: '',
            phone: '',
            email: '',
            daily_salary: null,
            bonus_percentage: null,
            salary_account_id: null,
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
    uiStore.closeEmployeeModal()
}

const saveEmployee = async () => {
    const { valid } = await formRef.value.validate()
    if (!valid) return

    try {
        if (uiStore.editingEmployee) {
            await employeesStore.updateEmployee(uiStore.editingEmployee.id, formData.value)
            uiStore.showSuccess('Сотрудник обновлён')
        } else {
            await employeesStore.createEmployee(formData.value)
            uiStore.showSuccess('Сотрудник создан')
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
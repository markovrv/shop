<template>
  <v-card>
    <v-card-title>Журнал проводок</v-card-title>
    <v-table>
      <thead>
        <tr>
          <th @click="sortEntries('date')">Дата</th>
          <th @click="sortEntries('document')">Документ</th>
          <th @click="sortEntries('description')">Описание</th>
          <th @click="sortEntries('debitAccountName')">Дебет</th>
          <th @click="sortEntries('creditAccountName')">Кредит</th>
          <th @click="sortEntries('amount')">Сумма</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in entriesStore.entries" :key="entry.id">
          <td>{{ entry.date }}</td>
          <td>{{ entry.document || '-' }}</td>
          <td>{{ entry.description }}</td>
          <td>{{ entry.debitAccountName }}</td>
          <td>{{ entry.creditAccountName }}</td>
          <td>{{ entry.amount }}</td>
          <td>
            <v-btn
              size="small"
              icon="mdi-pencil"
              variant="plain"
              @click="uiStore.openEntryModal(entry)"
            ></v-btn>
            <v-btn
              size="small"
              icon="mdi-delete"
              variant="plain"
              color="error"
              @click="handleDelete(entry.id)"
            ></v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
    
    <!-- Пагинация -->
    <v-card-actions v-if="entriesStore.pagination.total > entriesStore.pagination.limit">
      <v-spacer></v-spacer>
      <v-pagination
        v-model="entriesStore.pagination.page"
        :length="Math.ceil(entriesStore.pagination.total / entriesStore.pagination.limit)"
        @update:modelValue="handlePageChange"
      ></v-pagination>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useEntriesStore } from '../stores/entries.js'
import { useUiStore } from '../stores/ui.js'

const entriesStore = useEntriesStore()
const uiStore = useUiStore()

onMounted(async () => {
  await entriesStore.fetchEntries()
})

// Функция сортировки
const sortEntries = async (field) => {
  if (entriesStore.sortField === field) {
    entriesStore.sortDirection = entriesStore.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    entriesStore.sortField = field;
    entriesStore.sortDirection = 'asc';
  }
  await entriesStore.fetchEntries();
}

const handlePageChange = async (page) => {
  entriesStore.pagination.page = page
 await entriesStore.fetchEntries()
}

const handleDelete = async (id) => {
  if (confirm('Вы уверены?')) {
    try {
      await entriesStore.deleteEntry(id)
      uiStore.showSuccess('Проводка удалена')
    } catch (err) {
      uiStore.showError(err.message)
    }
  }
}

// Обновляем таблицу при изменении фильтров
watch(() => entriesStore.filters, async (newFilters, oldFilters) => {
 if (JSON.stringify(newFilters) !== JSON.stringify(oldFilters)) {
    await entriesStore.fetchEntries()
  }
}, { deep: true })
</script>
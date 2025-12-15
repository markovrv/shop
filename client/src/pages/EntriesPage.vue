<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="uiStore.openEntryModal()"
        >
          Новая проводка
        </v-btn>
      </v-col>
    </v-row>

    <FilterPanel @apply="handleFilterApply" @clear="handleFilterClear" />

    <EntriesTable />

    <EntryFormModal v-if="uiStore.showEntryModal" />
  </div>
</template>

<script setup>
import { useUiStore } from '../stores/ui.js'
import { useEntriesStore } from '../stores/entries.js'
import FilterPanel from '../components/FilterPanel.vue'
import EntriesTable from '../components/EntriesTable.vue'
import EntryFormModal from '../components/EntryFormModal.vue'

const uiStore = useUiStore()
const entriesStore = useEntriesStore()

const handleFilterApply = async (filters) => {
  entriesStore.setFilters(filters)
  await entriesStore.fetchEntries()
}

const handleFilterClear = async () => {
  entriesStore.clearFilters()
  await entriesStore.fetchEntries()
}
</script>
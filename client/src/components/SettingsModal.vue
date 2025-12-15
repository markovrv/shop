<template>
  <v-dialog v-model="localModel" max-width="600" @update:model-value="handleModelUpdate">
    <v-card>
      <v-card-title>Параметры</v-card-title>
      <v-card-text>
        <v-form>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="apiUrl" label="API URL" @change="saveApiUrl"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-btn @click="recalculate">Пересчитать остатки</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="closeModal">Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { adminApi } from '../api/client.js'
import { useUiStore } from '../stores/ui.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const uiStore = useUiStore()
const apiUrl = ref(localStorage.getItem('apiUrl') || (window.location.origin + '/api'))
const localModel = ref(props.modelValue)

// Синхронизируем localModel с пропсом
watch(() => props.modelValue, (newVal) => {
  localModel.value = newVal
})

const handleModelUpdate = (val) => {
  emit('update:modelValue', val)
}

const closeModal = () => {
  emit('update:modelValue', false)
}

const recalculate = async () => {
  try {
    await adminApi.recalculate()
    uiStore.showSuccess('Остатки пересчитаны')
    closeModal()
  } catch (err) {
    uiStore.showError(err.message)
  }
}

const saveApiUrl = () => {
  localStorage.setItem('apiUrl', apiUrl.value);
  // Обновляем страницу для применения новых настроек
  window.location.reload();
}
</script>
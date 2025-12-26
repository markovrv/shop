<template>
    <div>
        <v-row justify="center" align="start" style="margin-top: 100px;">
            <v-col cols="12" sm="8" md="6" lg="4">
                <v-card class="elevation-12" rounded="lg">
                    <v-card-title class="text-center py-6">
                        <h2 class="text-h5 font-weight-bold">Вход в систему</h2>
                    </v-card-title>

                    <v-card-text>
                        <v-form @submit.prevent="handleLogin" class="px-4" style="padding-bottom: 16px;">
                            <v-text-field v-model="credentials.login" label="Логин" prepend-inner-icons="mdi-account"
                                variant="outlined" required :disabled="loading" @keyup.enter="handleLogin" />

                            <v-text-field v-model="credentials.password" label="Пароль" prepend-inner-icons="mdi-lock"
                                variant="outlined" type="password" required :disabled="loading"
                                @keyup.enter="handleLogin" />

                            <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
                                {{ error }}
                            </v-alert>

                            <v-btn type="submit" color="primary" block size="large" :loading="loading"
                                :disabled="!credentials.login || !credentials.password">
                                <span v-if="loading">Вход...</span>
                                <span v-else>Войти</span>
                            </v-btn>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import { authApi } from '@/api/client.js';
import { useUiStore } from '@/stores/ui.js';
import { useRouter } from 'vue-router';

export default {
    name: 'LoginPage',
    setup() {
        const uiStore = useUiStore();
        const router = useRouter();

        return {
            uiStore,
            router
        };
    },
    data() {
        return {
            credentials: {
                login: '',
                password: ''
            },
            loading: false,
            error: ''
        };
    },
    methods: {
        async handleLogin() {
            this.loading = true;
            this.error = '';

            try {
                const {data} = await authApi.login(this.credentials);
                // Сохраняем токен в sessionStorage
                sessionStorage.setItem('token', data.token);
                this.uiStore.setUserLoginState(true);
                // Показываем сообщение об успешном входе
                this.uiStore.showSuccess(`Добро пожаловать, ${data.user.login}!`);

                // Перенаправляем на главную страницу
                this.router.push('/entries');
            } catch (error) {
                this.error = error.message || 'Ошибка при входе';
                this.uiStore.setUserLoginState(false);
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<style scoped>
.v-container {
    min-height: calc(100vh - 100px);
}
</style>
import { createRouter, createWebHashHistory } from 'vue-router'
import EntriesPage from '../pages/EntriesPage.vue'
import AccountsPage from '../pages/AccountsPage.vue'
import OwnersPage from '../pages/OwnersPage.vue'
import BalancesPage from '../pages/BalancesPage.vue'
import LoginPage from '../pages/LoginPage.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/',
      redirect: to => {
        // Проверяем наличие токена в sessionStorage
        const token = sessionStorage.getItem('token');
        return token ? '/entries' : '/login';
      }
    },
    {
      path: '/entries',
      name: 'entries',
      component: EntriesPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: AccountsPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/owners',
      name: 'owners',
      component: OwnersPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/balances',
      name: 'balances',
      component: BalancesPage,
      meta: { requiresAuth: true }
    },
  ],
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import EntriesPage from '../pages/EntriesPage.vue'
import AccountsPage from '../pages/AccountsPage.vue'
import BalancesPage from '../pages/BalancesPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/entries'
    },
    {
      path: '/entries',
      name: 'entries',
      component: EntriesPage,
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: AccountsPage,
    },
    {
      path: '/balances',
      name: 'balances',
      component: BalancesPage,
    },
  ],
})

export default router

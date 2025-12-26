# Bookkeeping Client

Frontend часть приложения для учета финансовых проводок. Разработана на Vue 3 с использованием Vuetify для UI компонентов и Pinia для управления состоянием.

## Функциональность

- Управление счетами (создание, редактирование, удаление)
- Создание и редактирование проводок (дебет/кредит)
- Просмотр остатков по счетам на любую дату
- Фильтрация и пагинация данных
- Адаптивный дизайн с поддержкой светлой и тёмной темы

## Технологии

- Vue 3 — фреймворк
- Vuetify 3 — компоненты Material Design
- Pinia — управление состоянием
- Vite — сборщик
- vue-router — маршрутизация
- Axios — HTTP клиент
- @mdi/font — иконки Material Design

## Установка

```bash
npm install
```

## Запуск

### Для разработки

```bash
npm run dev
```

### Для продакшена

```bash
npm run build
```

## Структура проекта

```
client/
├── src/
│   ├── components/          # Vue компоненты
│   │   ├── AccountFormModal.vue    # Модальное окно для создания/редактирования счетов
│   │   ├── EntriesTable.vue        # Таблица проводок
│   │   ├── EntryFormModal.vue      # Модальное окно для создания/редактирования проводок
│   │   ├── FilterPanel.vue         # Панель фильтров
│   │   └── SettingsModal.vue       # Модальное окно настроек
│   ├── pages/               # Страницы приложения
│   │   ├── AccountsPage.vue        # Страница управления счетами
│   │   ├── BalancesPage.vue        # Страница остатков
│   │   ├── EntriesPage.vue         # Страница проводок
│   │   └── LoginPage.vue           # Страница входа
│   ├── stores/              # Pinia хранилища
│   │   ├── accounts.js      # Хранилище счетов
│   │   ├── entries.js       # Хранилище проводок
│   │   ├── ui.js            # Хранилище UI состояний
│   │   └── index.js         # Главный файл хранилищ
│   ├── api/                 # HTTP клиент
│   │   └── client.js        # Конфигурация axios
│   ├── router/              # Роутинг приложения
│   │   └── index.js         # Определение маршрутов
│   ├── assets/              # Статические ресурсы
│   │   ├── logo.svg         # Логотип
│   │   └── main.css         # Глобальные стили
│   ├── App.vue              # Главный компонент приложения
│   └── main.js              # Точка входа в приложение
├── public/                  # Публичные ресурсы
├── package.json             # Зависимости и скрипты
├── vite.config.js           # Конфигурация Vite
└── jsconfig.json            # Конфигурация JavaScript
```

## Взаимодействие с API

Клиент взаимодействует с сервером через REST API. Базовый URL для API:
- Разработка: `http://localhost:3000/api`
- Продакшен: настраивается в `client/src/api/client.js`

## Страницы приложения

- `/accounts` — Управление счетами
- `/entries` — Создание и просмотр проводок
- `/balances` — Просмотр остатков по счетам
- `/login` — Страница входа (в будущем)

## Зависимости

См. `package.json` для полного списка зависимостей.

## Разработка

### Рекомендуемый IDE

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (и отключите Vetur).

### Рекомендуемый браузер

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
 - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

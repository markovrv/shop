import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

// Тестовые данные
const testData = {
  accounts: [],
  entries: []
};

// Функция для задержки
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAPI() {
  console.log('=== Тестирование API сервера ===\n');

  try {
    // 1. Проверка состояния сервера
    console.log('1. Проверка состояния сервера...');
    const healthResponse = await axios.get(`${BASE_URL}/admin/health`);
    console.log('✓ Состояние сервера:', healthResponse.data);
    
    // 2. Создание счетов
    console.log('\n2. Создание счетов...');
    
    // Создаем активный счет
    const assetAccount = await axios.post(`${BASE_URL}/accounts`, {
      name: 'Основные средства',
      type: 'asset',
      initialBalance: 10000
    });
    testData.accounts.push(assetAccount.data.data);
    console.log('✓ Создан активный счет:', assetAccount.data.data.name);
    
    // Создаем пассивный счет
    const liabilityAccount = await axios.post(`${BASE_URL}/accounts`, {
      name: 'Кредиторская задолженность',
      type: 'liability',
      initialBalance: 5000
    });
    testData.accounts.push(liabilityAccount.data.data);
    console.log('✓ Создан пассивный счет:', liabilityAccount.data.data.name);
    
    // Создаем счет доходов
    const incomeAccount = await axios.post(`${BASE_URL}/accounts`, {
      name: 'Выручка',
      type: 'income',
      initialBalance: 0
    });
    testData.accounts.push(incomeAccount.data.data);
    console.log('✓ Создан счет доходов:', incomeAccount.data.data.name);
    
    // Создаем счет расходов
    const expenseAccount = await axios.post(`${BASE_URL}/accounts`, {
      name: 'Расходы на рекламу',
      type: 'expense',
      initialBalance: 0
    });
    testData.accounts.push(expenseAccount.data.data);
    console.log('✓ Создан счет расходов:', expenseAccount.data.data.name);
    
    await delay(1000); // Задержка для корректного времени
    
    // 3. Получение всех счетов
    console.log('\n3. Получение всех счетов...');
    const accountsResponse = await axios.get(`${BASE_URL}/accounts`);
    console.log('✓ Получено счетов:', accountsResponse.data.data.length);
    
    // 4. Создание проводок
    console.log('\n4. Создание проводок...');
    
    // Создаем проводку: дебет "Расходы на рекламу", кредит "Кредиторская задолженность"
    const entry1 = await axios.post(`${BASE_URL}/entries`, {
      date: new Date().toISOString().split('T')[0],
      description: 'Оплата рекламы',
      debitAccountId: expenseAccount.data.data.id,
      creditAccountId: liabilityAccount.data.data.id,
      amount: 1000
    });
    testData.entries.push(entry1.data.data);
    console.log('✓ Создана проводка 1:', entry1.data.data.description);
    
    // Создаем проводку: дебет "Основные средства", кредит "Кредиторская задолженность"
    const entry2 = await axios.post(`${BASE_URL}/entries`, {
      date: new Date().toISOString().split('T')[0],
      description: 'Покупка оборудования',
      debitAccountId: assetAccount.data.data.id,
      creditAccountId: liabilityAccount.data.data.id,
      amount: 2000
    });
    testData.entries.push(entry2.data.data);
    console.log('✓ Создана проводка 2:', entry2.data.data.description);
    
    // Создаем проводку: дебет "Кредиторская задолженность", кредит "Выручка"
    const entry3 = await axios.post(`${BASE_URL}/entries`, {
      date: new Date().toISOString().split('T')[0],
      description: 'Поступление выручки',
      debitAccountId: liabilityAccount.data.data.id,
      creditAccountId: incomeAccount.data.data.id,
      amount: 3000
    });
    testData.entries.push(entry3.data.data);
    console.log('✓ Создана проводка 3:', entry3.data.data.description);
    
    await delay(1000); // Задержка для корректного времени
    
    // 5. Получение всех проводок
    console.log('\n5. Получение всех проводок...');
    const entriesResponse = await axios.get(`${BASE_URL}/entries`);
    console.log('✓ Получено проводок:', entriesResponse.data.data.length);
    
    // 6. Получение остатков по счетам
    console.log('\n6. Получение остатков по счетам...');
    const balancesResponse = await axios.get(`${BASE_URL}/balances`);
    console.log('✓ Остатки по счетам:');
    balancesResponse.data.data.forEach(balance => {
      console.log(`   - ${balance.accountName}: ${balance.balance}`);
    });
    
    // 7. Проверка фильтрации проводок по счету
    console.log('\n7. Проверка фильтрации проводок по счету...');
    const filteredEntries = await axios.get(`${BASE_URL}/entries?accountId=${liabilityAccount.data.data.id}`);
    console.log('✓ Проводки по счету "Кредиторская задолженность":', filteredEntries.data.data.length);
    
    // 8. Проверка административных функций
    console.log('\n8. Проверка административных функций...');
    const recalculateResponse = await axios.post(`${BASE_URL}/admin/recalculate`);
    console.log('✓ Перерасчет проводок:', recalculateResponse.data.message);
    
    // 9. Проверка состояния сервера после операций
    console.log('\n9. Проверка состояния сервера после операций...');
    const finalHealthResponse = await axios.get(`${BASE_URL}/admin/health`);
    console.log('✓ Финальное состояние сервера:', finalHealthResponse.data);
    
    console.log('\n=== Тестирование завершено успешно ===');
    console.log('\nСозданные счета:', testData.accounts.length);
    console.log('Созданные проводки:', testData.entries.length);
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании API:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Запуск тестирования
testAPI();
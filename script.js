// script.js
// Основные переменные
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
let selectedDay = null;
let massColoringMode = null;
let isKeyboardOpen = false; // Флаг для отслеживания состояния клавиатуры
let lastWindowHeight = window.innerHeight; // Запоминаем начальную высоту окна

// Хранение данных
let calendarData = loadFromStorage('calendarData') || {};

// Настройки приложения
let appSettings = loadFromStorage('appSettings') || {
  mode: 'official',
  official: {
    salesPercent: 7,
    shiftRate: 1000,
    fixedDeduction: 25000,
    advance: 10875,
    fixedSalaryPart: 10875
  },
  unofficial: {
    salesPercent: 7,
    shiftRate: 1000,
    advance: 0
  }
};

// Миграция старых настроек
if (appSettings.hasOwnProperty('useTax') && !appSettings.hasOwnProperty('mode')) {
  appSettings = {
    mode: 'official',
    official: {
      salesPercent: appSettings.salesPercent,
      shiftRate: appSettings.shiftRate,
      fixedDeduction: appSettings.fixedDeduction,
      advance: appSettings.advance,
      fixedSalaryPart: appSettings.fixedSalaryPart
    },
    unofficial: {
      salesPercent: 7,
      shiftRate: 1000,
      advance: 0
    }
  };
  saveToStorage('appSettings', appSettings);
}

// Функция безопасной загрузки из localStorage
function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Ошибка загрузки из localStorage:', error);
    return null;
  }
}

// Функция безопасного сохранения в localStorage
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Ошибка сохранения в localStorage:', error);
    showNotification('Ошибка сохранения данных');
    return false;
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    generateCalendar();
    setupEventListeners();
    initPeriodSelector();
    loadSettingsToForm();
    
    // Проверка первого запуска
    if (!localStorage.getItem('firstRun')) {
        localStorage.setItem('firstRun', 'true');
        showWelcomeMessage();
    }
    
    // Отслеживание изменения размера для определения клавиатуры
    window.addEventListener('resize', function() {
        const newHeight = window.innerHeight;
        const heightDifference = Math.abs(lastWindowHeight - newHeight);
        
        // Если изменение высоты значительное, считаем что клавиатура открыта/закрыта
        if (heightDifference > 200) {
            isKeyboardOpen = (newHeight < lastWindowHeight);
            lastWindowHeight = newHeight;
        }
    });
});

// Генерация календаря
function generateCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    
    // Заголовки дней недели
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    daysOfWeek.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'day-header';
        dayElement.textContent = day;
        calendar.appendChild(dayElement);
    });
    
    // Первый день месяца
    const firstDay = new Date(currentYear, currentMonth, 1);
    // Последний день месяца
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Пустые ячейки для дней предыдущего месяца
    const startOffset = (firstDay.getDay() || 7) - 1;
    for (let i = 0; i < startOffset; i++) {
        const empty = document.createElement('div');
        empty.className = 'day empty';
        calendar.appendChild(empty);
    }
    
    // Дни текущего месяца
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        
        const dateKey = `${currentYear}-${currentMonth+1}-${day}`;
        const dayData = calendarData[dateKey] || {};
        
        // Форматирование чисел для отображения
        const formatSalesNumber = (value) => {
            if (value >= 10000) return Math.floor(value / 1000);
            return value;
        };
        
        // Форматирование содержимого
        dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            ${dayData.sales ? `<div class="day-sales">${formatSalesNumber(dayData.sales)}</div>` : ''}
        `;
        
        // Цвет фона
        if (dayData.color) {
            dayElement.style.backgroundColor = dayData.color;
        }
        
        // Функциональная обводка
        if (dayData.functionalBorder) {
            dayElement.classList.add('functional-border');
        }
        
        // Иконка комментария
        if (dayData.comment) {
            const commentIcon = document.createElement('div');
            commentIcon.className = 'day-comment';
            commentIcon.textContent = '💬';
            commentIcon.style.position = 'absolute';
            commentIcon.style.top = '5px';
            commentIcon.style.right = '5px';
            commentIcon.style.fontSize = '0.8em';
            dayElement.appendChild(commentIcon);
        }
        
        // Проверка на текущий день
        const today = new Date();
        if (currentYear === today.getFullYear() && 
            currentMonth === today.getMonth() && 
            day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Обработчик клика
        dayElement.addEventListener('click', () => handleDayClick(day));
        calendar.appendChild(dayElement);
    }
    
    // Обновление заголовка
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    document.getElementById('current-month-year').textContent = 
        `${monthNames[currentMonth]} ${currentYear}`;
    
    // Расчеты
    calculateSummary();
}

// Обработчик клика по дню
function handleDayClick(day) {
    if (massColoringMode === 'fill') {
        applyFillColor(day);
    } else if (massColoringMode === 'border') {
        toggleFunctionalBorder(day);
    } else {
        openModal(day);
    }
}

// Установка/снятие функциональной обводки
function toggleFunctionalBorder(day) {
    const dateKey = `${currentYear}-${currentMonth+1}-${day}`;
    let dayData = calendarData[dateKey] || {};
    
    if (dayData.functionalBorder) {
        // Снятие обводки
        dayData.functionalBorder = false;
        dayData.sales = 0;
        showNotification('Обводка снята');
    } else {
        // Установка обводки
        dayData.functionalBorder = true;
        dayData.sales = 30000;
        showNotification('Обводка установлена, продажи: 30000 руб');
    }
    
    calendarData[dateKey] = dayData;
    saveToStorage('calendarData', calendarData);
    generateCalendar();
}

// Применение заливки
function applyFillColor(day) {
    const color = document.querySelector('.palette-tool.fill.active')?.dataset.color || '#ffffff';
    const dateKey = `${currentYear}-${currentMonth+1}-${day}`;
    let dayData = calendarData[dateKey] || {};
    
    dayData.color = color;
    calendarData[dateKey] = dayData;
    saveToStorage('calendarData', calendarData);
    generateCalendar();
}

// Открытие модального окна
function openModal(day) {
    selectedDay = day;
    const dateKey = `${currentYear}-${currentMonth+1}-${day}`;
    const dayData = calendarData[dateKey] || {};
    
    document.getElementById('modal-day').textContent = day;
    document.getElementById('sales-input').value = dayData.sales || '';
    document.getElementById('comment-input').value = dayData.comment || '';
    
    // Выбор цвета
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.color === dayData.color) {
            option.classList.add('selected');
        }
    });
    
    // Заполнение настроек дня
    document.getElementById('day-sales-percent').value = dayData.customSalesPercent || '';
    document.getElementById('day-shift-rate').value = dayData.customShiftRate || '';
    
    // Сброс видимости настроек дня
    document.getElementById('day-settings').style.display = 'none';
    
    document.getElementById('modal').style.display = 'block';
    document.body.classList.add('modal-open');
}

// Сохранение данных дня
function saveDayData() {
    const sales = parseInt(document.getElementById('sales-input').value) || 0;
    const comment = document.getElementById('comment-input').value;
    const selectedColor = document.querySelector('.color-option.selected')?.dataset.color;
    const customSalesPercent = document.getElementById('day-sales-percent').value ? 
        parseFloat(document.getElementById('day-sales-percent').value) : null;
    const customShiftRate = document.getElementById('day-shift-rate').value ? 
        parseInt(document.getElementById('day-shift-rate').value) : null;
    
    const dateKey = `${currentYear}-${currentMonth+1}-${selectedDay}`;
    calendarData[dateKey] = {
        sales: sales,
        comment: comment,
        color: selectedColor,
        customSalesPercent: customSalesPercent,
        customShiftRate: customShiftRate
    };
    
    saveToStorage('calendarData', calendarData);
    closeModal();
    generateCalendar();
}

// Закрытие модального окна
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('summary-modal').style.display = 'none';
    document.getElementById('period-modal').style.display = 'none';
    document.getElementById('settings-modal').style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Расчеты
function calculateSummary() {
    const monthDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    let workDays = 0;
    let totalSales = 0;
    let totalEarnedWithoutTax = 0;
    
    for (let day = 1; day <= monthDays; day++) {
        const dateKey = `${currentYear}-${currentMonth+1}-${day}`;
        const dayData = calendarData[dateKey] || {};
        
        if (dayData.sales > 0) {
            workDays++;
            totalSales += dayData.sales;
            
            if (appSettings.mode === 'official') {
                // Используем индивидуальные настройки дня или общие
                const dayPercent = dayData.customSalesPercent || appSettings.official.salesPercent;
                const dayShiftRate = dayData.customShiftRate || appSettings.official.shiftRate;
                
                totalEarnedWithoutTax += calculateEarnings(dayData.sales, dayPercent) + dayShiftRate;
            } else {
                // Неофициальный режим: используем настройки из unofficial
                const dayPercent = dayData.customSalesPercent || appSettings.unofficial.salesPercent;
                const dayShiftRate = dayData.customShiftRate || appSettings.unofficial.shiftRate;
                
                totalEarnedWithoutTax += calculateEarnings(dayData.sales, dayPercent) + dayShiftRate;
            }
        }
    }
    
    let totalEarned = 0;
    let salary = 0;
    let balance = 0;
    
    if (appSettings.mode === 'official') {
        const tax = appSettings.official.fixedDeduction * 0.13;
        totalEarned = totalEarnedWithoutTax - tax;
        salary = totalEarned - appSettings.official.advance;
        balance = salary - appSettings.official.fixedSalaryPart;
    } else {
        // Неофициальный режим
        totalEarned = totalEarnedWithoutTax;
        salary = totalEarned - appSettings.unofficial.advance;
        balance = salary;
    }
    
    document.getElementById('modal-work-days').textContent = workDays;
    document.getElementById('modal-total-sales').textContent = totalSales.toLocaleString();
    document.getElementById('modal-total-earned').textContent = totalEarned.toLocaleString();
    document.getElementById('modal-salary').textContent = salary.toLocaleString();
    document.getElementById('modal-balance').textContent = balance.toLocaleString();
    document.getElementById('summary-month-year').textContent = 
        `${new Date(currentYear, currentMonth).toLocaleString('ru', { month: 'long' })} ${currentYear}`;
        
    // Скрываем строку с остатком в неофициальном режиме
    const balanceRow = document.getElementById('balance-row');
    if (appSettings.mode === 'unofficial') {
        balanceRow.style.display = 'none';
    } else {
        balanceRow.style.display = 'block';
    }
}

// Расчет заработка за день с учетом индивидуального процента
function calculateEarnings(sales, percent) {
    return sales * (percent / 100);
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Навигация по месяцам
    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar();
    });
    
    // Выбор месяца/года
    document.getElementById('month-year-selector').addEventListener('click', () => {
        document.getElementById('period-modal').style.display = 'block';
        document.body.classList.add('modal-open');
    });
    
    // Палитра
    document.getElementById('palette-btn').addEventListener('click', () => {
        const palettePanel = document.getElementById('palette-panel');
        const isOpen = palettePanel.style.display === 'flex';
        
        if (isOpen) {
            palettePanel.style.display = 'none';
            document.getElementById('palette-btn').classList.remove('active');
            massColoringMode = null;
            document.querySelectorAll('.palette-tool').forEach(tool => {
                tool.classList.remove('active');
            });
        } else {
            palettePanel.style.display = 'flex';
            document.getElementById('palette-btn').classList.add('active');
        }
    });
    
    // Инструменты палитры
    document.querySelectorAll('.palette-tool.fill').forEach(tool => {
        tool.addEventListener('click', () => {
            document.querySelectorAll('.palette-tool.fill').forEach(t => t.classList.remove('active'));
            tool.classList.add('active');
            massColoringMode = 'fill';
        });
    });
    
    document.getElementById('palette-border').addEventListener('click', () => {
        massColoringMode = massColoringMode === 'border' ? null : 'border';
        document.getElementById('palette-border').classList.toggle('active');
    });
    
    // Модальные окна
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModal);
    });
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    // Сохранение данных
    document.getElementById('save-data').addEventListener('click', saveDayData);
    
    // Расчеты
    document.getElementById('summary-btn').addEventListener('click', () => {
        document.getElementById('summary-modal').style.display = 'block';
        document.body.classList.add('modal-open');
    });
    
    // Настройки
    document.getElementById('settings-btn').addEventListener('click', () => {
        document.getElementById('settings-modal').style.display = 'block';
        document.body.classList.add('modal-open');
        updateSettingsUI();
    });
    
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    
    // Экспорт/импорт
    document.getElementById('export-btn').addEventListener('click', exportData);
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    
    document.getElementById('import-file').addEventListener('change', importData);
    
    // Обновление версии
    document.getElementById('update-btn').addEventListener('click', updateAppVersion);
    
    // Выбор цвета в модальном окне
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
    
    // Настройки дня
    document.getElementById('day-settings-btn').addEventListener('click', function() {
        const settingsPanel = document.getElementById('day-settings');
        settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
    });
    
    document.getElementById('reset-day-settings').addEventListener('click', function() {
        document.getElementById('day-sales-percent').value = '';
        document.getElementById('day-shift-rate').value = '';
    });
    
    // Переключение режимов в настройках
    document.getElementById('mode-selector').addEventListener('change', function() {
        updateSettingsUI();
    });
    
    // Обработка клавиш
    document.addEventListener('keydown', handleKeyPress);
}

// Обработка нажатий клавиш
function handleKeyPress(e) {
    if (document.getElementById('modal').style.display === 'block') {
        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'Enter') {
            saveDayData();
        }
    }
}

// Инициализация выбора периода
function initPeriodSelector() {
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    
    // Заполнение месяцев
    const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
                   "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        if (index === currentMonth) option.selected = true;
        monthSelect.appendChild(option);
    });
    
    // Заполнение годов (текущий год ± 5 лет)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }
    
    // Применение выбора
    document.getElementById('apply-period').addEventListener('click', () => {
        currentMonth = parseInt(monthSelect.value);
        currentYear = parseInt(yearSelect.value);
        generateCalendar();
        closeModal();
    });
}

// Загрузка настроек в форму
function loadSettingsToForm() {
    const mode = appSettings.mode;
    document.getElementById('mode-selector').value = mode;
    
    if (mode === 'official') {
        document.getElementById('official-sales-percent').value = appSettings.official.salesPercent;
        document.getElementById('official-shift-rate').value = appSettings.official.shiftRate;
        document.getElementById('official-fixed-deduction').value = appSettings.official.fixedDeduction;
        document.getElementById('official-advance').value = appSettings.official.advance;
        document.getElementById('official-fixed-salary-part').value = appSettings.official.fixedSalaryPart;
    } else {
        document.getElementById('unofficial-sales-percent').value = appSettings.unofficial.salesPercent;
        document.getElementById('unofficial-shift-rate').value = appSettings.unofficial.shiftRate;
        document.getElementById('unofficial-advance').value = appSettings.unofficial.advance;
    }
    
    updateSettingsUI();
}

// Обновление интерфейса настроек
function updateSettingsUI() {
    const mode = document.getElementById('mode-selector').value;
    const officialSettings = document.getElementById('official-settings');
    const unofficialSettings = document.getElementById('unofficial-settings');
    
    if (mode === 'official') {
        officialSettings.style.display = 'block';
        unofficialSettings.style.display = 'none';
    } else {
        officialSettings.style.display = 'none';
        unofficialSettings.style.display = 'block';
    }
}

// Сохранение настроек
function saveSettings() {
    const mode = document.getElementById('mode-selector').value;
    
    if (mode === 'official') {
        appSettings = {
            mode: mode,
            official: {
                salesPercent: parseFloat(document.getElementById('official-sales-percent').value),
                shiftRate: parseInt(document.getElementById('official-shift-rate').value),
                fixedDeduction: parseInt(document.getElementById('official-fixed-deduction').value),
                advance: parseInt(document.getElementById('official-advance').value),
                fixedSalaryPart: parseInt(document.getElementById('official-fixed-salary-part').value)
            },
            unofficial: appSettings.unofficial
        };
    } else {
        appSettings = {
            mode: mode,
            official: appSettings.official,
            unofficial: {
                salesPercent: parseFloat(document.getElementById('unofficial-sales-percent').value),
                shiftRate: parseInt(document.getElementById('unofficial-shift-rate').value),
                advance: parseInt(document.getElementById('unofficial-advance').value)
            }
        };
    }
    
    saveToStorage('appSettings', appSettings);
    showNotification('Настройки сохранены');
    closeModal();
    generateCalendar();
}

// Экспорт данных
function exportData() {
    const data = {
        calendarData: calendarData,
        appSettings: appSettings,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendar-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Данные экспортированы');
}

// Импорт данных
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.calendarData && data.appSettings) {
                calendarData = data.calendarData;
                appSettings = data.appSettings;
                
                saveToStorage('calendarData', calendarData);
                saveToStorage('appSettings', appSettings);
                
                generateCalendar();
                showNotification('Данные успешно импортированы');
            } else {
                showNotification('Ошибка: Неверный формат файла');
            }
        } catch (error) {
            console.error('Ошибка импорта:', error);
            showNotification('Ошибка при импорте данных');
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Сброс значения для возможности повторного выбора того же файла
}

// Обновление версии приложения
function updateAppVersion() {
    showNotification('Обновление... Данные сохранены.');
    
    // Сохраняем текущие данные перед обновлением
    const success = saveToStorage('calendarData', calendarData) && saveToStorage('appSettings', appSettings);
    
    if (success) {
        // Очищаем кэш Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for (let registration of registrations) {
                    registration.unregister();
                }
            });
        }
        
        // Принудительная перезагрузка страницы с очисткой кэша
        setTimeout(() => {
            window.location.reload(true);
        }, 1000);
    } else {
        showNotification('Ошибка при сохранении данных перед обновлением');
    }
}

// Показ уведомлений
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Приветственное сообщение
function showWelcomeMessage() {
    const welcomeMessage = `
        Добро пожаловать в Calendar Calculator! 📊
        
        Основные возможности:
        • 📅 Отслеживание продаж по дням
        • 💰 Автоматический расчет заработка
        • 🎨 Цветовое кодирование дней
        • 💬 Добавление комментариев
        • ⚙️ Гибкие настройки расчета
        • 📤 Экспорт/импорт данных
        
        Начните с ввода данных продаж за сегодняшний день!
    `;
    
    alert(welcomeMessage);
}

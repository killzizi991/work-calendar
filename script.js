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
    fixedSalaryPart: 10875,
    functionalBorderValue: 30000
  },
  unofficial: {
    salesPercent: 7,
    shiftRate: 1000,
    advance: 0,
    functionalBorderValue: 30000
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
      fixedSalaryPart: appSettings.fixedSalaryPart,
      functionalBorderValue: 30000
    },
    unofficial: {
      salesPercent: 7,
      shiftRate: 1000,
      advance: 0,
      functionalBorderValue: 30000
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

// Функция проверки целостности импортируемых данных
function validateImportedData(data) {
  try {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    // Проверяем наличие обязательных полей
    if (!data.hasOwnProperty('calendarData') || !data.hasOwnProperty('appSettings')) {
      return false;
    }

    // Проверяем тип calendarData
    if (typeof data.calendarData !== 'object' || data.calendarData === null) {
      return false;
    }

    // Проверяем тип appSettings
    if (typeof data.appSettings !== 'object' || data.appSettings === null) {
      return false;
    }

    // Дополнительная проверка структуры appSettings
    if (!data.appSettings.hasOwnProperty('mode') || 
        !data.appSettings.hasOwnProperty('official') || 
        !data.appSettings.hasOwnProperty('unofficial')) {
      return false;
    }

    // Проверяем структуру official настроек
    const official = data.appSettings.official;
    if (!official.hasOwnProperty('salesPercent') || 
        !official.hasOwnProperty('shiftRate') || 
        !official.hasOwnProperty('fixedDeduction') || 
        !official.hasOwnProperty('advance') || 
        !official.hasOwnProperty('fixedSalaryPart') || 
        !official.hasOwnProperty('functionalBorderValue')) {
      return false;
    }

    // Проверяем структуру unofficial настроек
    const unofficial = data.appSettings.unofficial;
    if (!unofficial.hasOwnProperty('salesPercent') || 
        !unofficial.hasOwnProperty('shiftRate') || 
        !unofficial.hasOwnProperty('advance') || 
        !unofficial.hasOwnProperty('functionalBorderValue')) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Ошибка валидации данных:', error);
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
        
        // Цвет фона - белый цвет удаляет заливку
        if (dayData.color) {
            if (dayData.color === '#ffffff') {
                dayElement.style.backgroundColor = '';
            } else {
                dayElement.style.backgroundColor = dayData.color;
            }
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
        dayData.sales = appSettings[appSettings.mode].functionalBorderValue;
        showNotification(`Обводка установлена, продажи: ${appSettings[appSettings.mode].functionalBorderValue} руб`);
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
    document.getElementById('export-modal').style.display = 'none';
    document.getElementById('import-modal').style.display = 'none';
    document.getElementById('help-modal').style.display = 'none';
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
    document.getElementById('export-btn').addEventListener('click', showExportModal);
    document.getElementById('import-btn').addEventListener('click', showImportModal);
    
    document.getElementById('import-file').addEventListener('change', importData);
    
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
    
    // Кнопка обновления версии
    document.getElementById('update-btn').addEventListener('click', forceUpdate);
    
    // Кнопка помощи
    document.getElementById('help-btn').addEventListener('click', showHelpModal);
    
    // Обработка клавиш
    document.addEventListener('keydown', handleKeyPress);
    
    // Новые обработчики для экспорта/импорта
    document.getElementById('copy-data-btn').addEventListener('click', copyDataToClipboard);
    document.getElementById('save-file-btn').addEventListener('click', exportData);
    document.getElementById('import-file-btn').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-text-btn').addEventListener('click', importFromText);
}

// Показать модальное окно помощи
function showHelpModal() {
    const helpContent = document.getElementById('help-content');
    helpContent.innerHTML = `
        <h3>Инструкция по использованию приложения</h3>
        <p><strong>Добавление продаж:</strong> Нажмите на день в календаре и введите сумму продаж.</p>
        <p><strong>Комментарии:</strong> Добавьте комментарий к дню в модальном окне.</p>
        <p><strong>Заливка цветом:</strong> Выберите цвет в палитре и нажмите на дни для закрашивания.</p>
        <p><strong>Функциональная обводка:</strong> Нажмите кнопку "Обводка" и выберите дни для установки/снятия обводки.</p>
        <p><strong>Настройки:</strong> Измените параметры расчета в настройках приложения.</p>
        <p><strong>Экспорт/Импорт:</strong> Сохраните данные в файл или загрузите из файла/текста.</p>
    `;
    document.getElementById('help-modal').style.display = 'block';
    document.body.classList.add('modal-open');
}

// Обработка нажатия клавиш
function handleKeyPress(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
}

// Обновление UI настроек
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
    
    appSettings.mode = mode;
    
    if (mode === 'official') {
        appSettings.official = {
            salesPercent: parseFloat(document.getElementById('official-sales-percent').value),
            shiftRate: parseInt(document.getElementById('official-shift-rate').value),
            fixedDeduction: parseInt(document.getElementById('official-fixed-deduction').value),
            advance: parseInt(document.getElementById('official-advance').value),
            fixedSalaryPart: parseInt(document.getElementById('official-fixed-salary-part').value),
            functionalBorderValue: parseInt(document.getElementById('official-functional-border-value').value)
        };
    } else {
        appSettings.unofficial = {
            salesPercent: parseFloat(document.getElementById('unofficial-sales-percent').value),
            shiftRate: parseInt(document.getElementById('unofficial-shift-rate').value),
            advance: parseInt(document.getElementById('unofficial-advance').value),
            functionalBorderValue: parseInt(document.getElementById('unofficial-functional-border-value').value)
        };
    }
    
    if (saveToStorage('appSettings', appSettings)) {
        showNotification('Настройки сохранены');
        closeModal();
        generateCalendar(); // Пересчитываем календарь с новыми настройками
    }
}

// Загрузка настроек в форму
function loadSettingsToForm() {
    document.getElementById('mode-selector').value = appSettings.mode;
    
    // Официальные настройки
    document.getElementById('official-sales-percent').value = appSettings.official.salesPercent;
    document.getElementById('official-shift-rate').value = appSettings.official.shiftRate;
    document.getElementById('official-fixed-deduction').value = appSettings.official.fixedDeduction;
    document.getElementById('official-advance').value = appSettings.official.advance;
    document.getElementById('official-fixed-salary-part').value = appSettings.official.fixedSalaryPart;
    document.getElementById('official-functional-border-value').value = appSettings.official.functionalBorderValue;
    
    // Неофициальные настройки
    document.getElementById('unofficial-sales-percent').value = appSettings.unofficial.salesPercent;
    document.getElementById('unofficial-shift-rate').value = appSettings.unofficial.shiftRate;
    document.getElementById('unofficial-advance').value = appSettings.unofficial.advance;
    document.getElementById('unofficial-functional-border-value').value = appSettings.unofficial.functionalBorderValue;
    
    updateSettingsUI();
}

// Показать уведомление
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Инициализация выбора периода
function initPeriodSelector() {
    const yearSelect = document.getElementById('year-select');
    const monthSelect = document.getElementById('month-select');
    
    // Заполнение годов
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    
    // Заполнение месяцев
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                   'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
    
    // Установка текущих значений
    yearSelect.value = currentYear;
    monthSelect.value = currentMonth;
    
    // Обработчик применения периода
    document.getElementById('apply-period').addEventListener('click', () => {
        currentYear = parseInt(yearSelect.value);
        currentMonth = parseInt(monthSelect.value);
        generateCalendar();
        closeModal();
    });
}

// Принудительное обновление приложения
function forceUpdate() {
    if (confirm('Обновить приложение? Все локальные данные будут сохранены.')) {
        localStorage.removeItem('appCacheVersion');
        window.location.reload();
    }
}

// Показать приветственное сообщение
function showWelcomeMessage() {
    showNotification('Добро пожаловать! Для начала работы добавьте продажи за день, нажав на дату в календаре.');
}

// Экспорт данных
function exportData() {
    const data = {
        calendarData: calendarData,
        appSettings: appSettings
    };
    
    const dataStr = JSON.stringify(data);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `calendar-data-${currentYear}-${currentMonth+1}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Показать модальное окно экспорта
function showExportModal() {
    document.getElementById('export-modal').style.display = 'block';
    document.body.classList.add('modal-open');
}

// Показать модальное окно импорта
function showImportModal() {
    document.getElementById('import-modal').style.display = 'block';
    document.body.classList.add('modal-open');
}

// Импорт данных
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Проверка целостности данных перед импортом
            if (!validateImportedData(data)) {
                showNotification('Ошибка: файл поврежден или имеет неверный формат');
                return;
            }
            
            // Импорт данных
            if (data.calendarData) {
                calendarData = data.calendarData;
                saveToStorage('calendarData', calendarData);
            }
            
            if (data.appSettings) {
                appSettings = data.appSettings;
                saveToStorage('appSettings', appSettings);
            }
            
            showNotification('Данные успешно импортированы');
            generateCalendar();
            closeModal();
        } catch (error) {
            console.error('Ошибка импорта:', error);
            showNotification('Ошибка импорта данных');
        }
    };
    reader.readAsText(file);
}

// Импорт из текста
function importFromText() {
    const importText = document.getElementById('import-text').value;
    
    if (!importText.trim()) {
        showNotification('Введите данные для импорта');
        return;
    }
    
    try {
        const data = JSON.parse(importText);
        
        // Проверка целостности данных перед импортом
        if (!validateImportedData(data)) {
            showNotification('Ошибка: данные повреждены или имеют неверный формат');
            return;
        }
        
        // Импорт данных
        if (data.calendarData) {
            calendarData = data.calendarData;
            saveToStorage('calendarData', calendarData);
        }
        
        if (data.appSettings) {
            appSettings = data.appSettings;
            saveToStorage('appSettings', appSettings);
        }
        
        showNotification('Данные успешно импортированы');
        generateCalendar();
        closeModal();
    } catch (error) {
        console.error('Ошибка импорта:', error);
        showNotification('Ошибка импорта данных');
    }
}

// Копирование данных в буфер обмена
function copyDataToClipboard() {
    const data = {
        calendarData: calendarData,
        appSettings: appSettings
    };
    
    const dataStr = JSON.stringify(data);
    
    navigator.clipboard.writeText(dataStr).then(() => {
        showNotification('Данные скопированы в буфер обмена');
    }).catch(err => {
        console.error('Ошибка копирования:', err);
        showNotification('Ошибка копирования данных');
    });
}

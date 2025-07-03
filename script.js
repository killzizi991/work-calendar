// Основные переменные
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
let selectedDay = null;
let massColoringMode = null; // 'fill', 'border', или null

// Хранение данных
let calendarData = JSON.parse(localStorage.getItem('calendarData')) || {};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    generateCalendar();
    setupEventListeners();
    initPeriodSelector();
    
    // Проверка первого запуска
    if (!localStorage.getItem('firstRun')) {
        localStorage.setItem('firstRun', 'true');
        showWelcomeMessage();
    }
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
            if (value >= 100000) return (value/1000).toFixed(0) + 'k';
            if (value >= 10000) return (value/1000).toFixed(1) + 'k';
            return value;
        };
        
        // Форматирование содержимого
        dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            ${dayData.sales ? `<div class="day-sales">${formatSalesNumber(dayData.sales)} руб</div>` : ''}
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
        // Проверка перед установкой
        if (dayData.sales && dayData.sales !== 0) {
            showNotification('Сначала обнулите значение');
            return;
        }
        // Установка обводки
        dayData.functionalBorder = true;
        dayData.sales = 30000;
        showNotification('Обводка установлена');
    }
    
    calendarData[dateKey] = dayData;
    localStorage.setItem('calendarData', JSON.stringify(calendarData));
    generateCalendar();
}

// Применение цвета в режиме массового окрашивания
function applyFillColor(day) {
    const dateKey = `${currentYear}-${currentMonth+1}-${day}`;
    let dayData = calendarData[dateKey] || {};
    const activeColor = document.querySelector('.palette-tool.fill.active');
    
    if (activeColor) {
        dayData.color = activeColor.dataset.color;
        calendarData[dateKey] = dayData;
        localStorage.setItem('calendarData', JSON.stringify(calendarData));
        generateCalendar();
    }
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
    
    // Закрытие модального окна
    document.querySelector('.close').addEventListener('click', closeModal);
    
    // Сохранение данных
    document.getElementById('save-data').addEventListener('click', saveDayData);
    
    // Выбор цвета
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(el => 
                el.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Закрытие по клику вне окна
    window.addEventListener('click', (event) => {
        if (event.target === document.getElementById('modal')) {
            closeModal();
        }
        if (event.target === document.getElementById('summary-modal')) {
            closeSummaryModal();
        }
        if (event.target === document.getElementById('period-modal')) {
            closePeriodModal();
        }
    });
    
    // Сохранение при закрытии вкладки
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('calendarData', JSON.stringify(calendarData));
    });
    
    // Кнопка расчетов
    document.getElementById('summary-btn').addEventListener('click', showSummaryModal);
    
    // Открытие выбора периода
    document.getElementById('month-year-selector').addEventListener('click', openPeriodModal);
    
    // Кнопка "Назад" в выборе периода
    document.getElementById('period-back').addEventListener('click', goBackToYears);
    
    // Закрытие всех модальных окон
    document.querySelectorAll('.modal .close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Кнопка палитры
    document.getElementById('palette-btn').addEventListener('click', togglePaletteMode);
    
    // Инструменты палитры
    document.querySelectorAll('.palette-tool.fill').forEach(tool => {
        tool.addEventListener('click', function() {
            // Сброс предыдущего выбора
            document.querySelectorAll('.palette-tool').forEach(t => 
                t.classList.remove('active'));
            
            // Активация выбранного
            this.classList.add('active');
            massColoringMode = 'fill';
        });
    });
    
    // Инструмент обводки
    document.getElementById('palette-border').addEventListener('click', function() {
        document.querySelectorAll('.palette-tool').forEach(t => 
            t.classList.remove('active'));
        this.classList.add('active');
        massColoringMode = 'border';
    });
}

// Переключение режима палитры
function togglePaletteMode() {
    const paletteBtn = document.getElementById('palette-btn');
    const palettePanel = document.getElementById('palette-panel');
    
    if (palettePanel.style.display === 'flex') {
        // Выход из режима
        palettePanel.style.display = 'none';
        paletteBtn.classList.remove('active');
        massColoringMode = null;
        document.querySelectorAll('.palette-tool').forEach(t => 
            t.classList.remove('active'));
    } else {
        // Вход в режим
        palettePanel.style.display = 'flex';
        paletteBtn.classList.add('active');
    }
}

// Инициализация выбора периода
function initPeriodSelector() {
    const yearsContainer = document.getElementById('year-options');
    const monthsContainer = document.getElementById('month-options');
    
    // Генерация годов (2024-2030)
    for (let year = 2024; year <= 2030; year++) {
        const yearBtn = document.createElement('button');
        yearBtn.textContent = year;
        yearBtn.className = 'period-option';
        yearBtn.addEventListener('click', () => selectYear(year));
        yearsContainer.appendChild(yearBtn);
    }
    
    // Генерация месяцев
    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    months.forEach((month, index) => {
        const monthBtn = document.createElement('button');
        monthBtn.textContent = month;
        monthBtn.className = 'period-option';
        monthBtn.addEventListener('click', () => selectMonth(index));
        monthsContainer.appendChild(monthBtn);
    });
}

// Открытие модального окна выбора периода
function openPeriodModal() {
    document.getElementById('period-modal').style.display = 'block';
    document.getElementById('year-step').style.display = 'block';
    document.getElementById('month-step').style.display = 'none';
    document.getElementById('period-back').style.display = 'none';
}

// Выбор года
function selectYear(year) {
    currentYear = year;
    document.getElementById('year-step').style.display = 'none';
    document.getElementById('month-step').style.display = 'block';
    document.getElementById('period-back').style.display = 'block';
}

// Выбор месяца
function selectMonth(month) {
    currentMonth = month;
    generateCalendar();
    closePeriodModal();
}

// Кнопка "Назад" в выборе периода
function goBackToYears() {
    document.getElementById('year-step').style.display = 'block';
    document.getElementById('month-step').style.display = 'none';
    document.getElementById('period-back').style.display = 'none';
}

// Закрытие модального окна периода
function closePeriodModal() {
    document.getElementById('period-modal').style.display = 'none';
}

// Открытие модального окна дня
function openModal(day) {
    selectedDay = day;
    const modal = document.getElementById('modal');
    document.getElementById('modal-day').textContent = day;
    
    // Загрузка существующих данных
    const dateKey = `${currentYear}-${currentMonth+1}-${day}`;
    const dayData = calendarData[dateKey] || {};
    
    // Если есть обводка, показываем 30000
    document.getElementById('sales-input').value = 
        dayData.functionalBorder ? 30000 : (dayData.sales || '');
    
    document.getElementById('comment-input').value = dayData.comment || '';
    
    // Сброс выбора цвета
    document.querySelectorAll('.color-option').forEach(el => 
        el.classList.remove('selected'));
    
    // Выбор сохраненного цвета
    if (dayData.color) {
        const colorOption = [...document.querySelectorAll('.color-option')].find(
            opt => opt.dataset.color === dayData.color
        );
        if (colorOption) colorOption.classList.add('selected');
    }
    
    modal.style.display = 'block';
    setTimeout(() => {
        document.getElementById('sales-input').focus();
    }, 300);
}

// Закрытие модального окна
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Сохранение данных дня
function saveDayData() {
    const dateKey = `${currentYear}-${currentMonth+1}-${selectedDay}`;
    const selectedColor = document.querySelector('.color-option.selected')?.dataset.color || '#ffffff';
    const salesValue = parseInt(document.getElementById('sales-input').value) || 0;
    
    // Проверяем, было ли значение изменено
    const hadFunctionalBorder = calendarData[dateKey]?.functionalBorder || false;
    
    // Снимаем обводку если:
    // 1. Была обводка и значение изменилось с 30000
    // 2. Пользователь вручную изменил значение
    const removeBorder = hadFunctionalBorder && salesValue !== 30000;
    
    calendarData[dateKey] = {
        ...calendarData[dateKey],
        sales: salesValue,
        comment: document.getElementById('comment-input').value || '',
        color: selectedColor,
        // Снимаем обводку если значение изменилось
        functionalBorder: hadFunctionalBorder && !removeBorder
    };
    
    // Сохранение в localStorage
    localStorage.setItem('calendarData', JSON.stringify(calendarData));
    
    // Обновление интерфейса
    generateCalendar();
    closeModal();
    
    // Уведомление о сохранении
    showNotification('Данные сохранены!');
}

// Расчет зарплаты
function calculateSummary() {
    let workDays = 0;
    let totalSales = 0;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${currentYear}-${currentMonth+1}-${day}`;
        if (calendarData[dateKey] && calendarData[dateKey].sales > 0) {
            workDays++;
            totalSales += calendarData[dateKey].sales;
        }
    }
    
    // Измененные расчеты
    const totalEarnedBeforeTax = (totalSales * 0.07) + (workDays * 1000);
    const totalEarned = totalEarnedBeforeTax;
    const balance = totalEarned - 25000; // Остаток = всего заработано - 25000
    const salary = balance + 10875;     // Зарплата = остаток + 10875
    
    return {
        workDays,
        totalSales,
        totalEarned,
        salary,
        balance
    };
}

// Показать модальное окно с расчетами
function showSummaryModal() {
    const summaryData = calculateSummary();
    const modal = document.getElementById('summary-modal');
    
    document.getElementById('modal-work-days').textContent = summaryData.workDays;
    document.getElementById('modal-total-sales').textContent = summaryData.totalSales;
    document.getElementById('modal-total-earned').textContent = summaryData.totalEarned.toFixed(2);
    document.getElementById('modal-salary').textContent = summaryData.salary.toFixed(2);
    document.getElementById('modal-balance').textContent = summaryData.balance.toFixed(2);
    
    document.getElementById('summary-month-year').textContent = 
        document.getElementById('current-month-year').textContent;
    
    modal.style.display = 'block';
}

// Закрыть модальное окно расчетов
function closeSummaryModal() {
    document.getElementById('summary-modal').style.display = 'none';
}

// Показать уведомление
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translate(-50%, 0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, 20px)';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 2000);
}

// Приветственное сообщение
function showWelcomeMessage() {
    setTimeout(() => {
        showNotification('Добро пожаловать! Кликните на день для ввода данных');
    }, 1000);
}

// Экспорт данных
function exportData() {
    const dataStr = JSON.stringify(calendarData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendar-data-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Импорт данных
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            calendarData = importedData;
            localStorage.setItem('calendarData', JSON.stringify(calendarData));
            generateCalendar();
            showNotification('Данные успешно импортированы!');
        } catch (error) {
            showNotification('Ошибка импорта: неверный формат файла');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
}

// Добавление CSS для уведомлений при первом запуске
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background-color: #4e73df;
            color: white;
            padding: 12px 25px;
            border-radius: 25px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            opacity: 0;
            transition: all 0.3s ease;
            font-size: 0.9rem;
            white-space: nowrap;
        }
    `;
    document.head.appendChild(style);
}

// Оптимизация для Android: перестраиваем календарь при изменении размера
window.addEventListener('resize', () => {
    generateCalendar();
});

// Инициализация Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker зарегистрирован', reg))
            .catch(err => console.error('Ошибка регистрации Service Worker', err));
    });
}

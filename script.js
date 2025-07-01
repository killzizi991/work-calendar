// Основные переменные
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
let selectedDay = null;

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
        
        // Форматирование содержимого
        dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            ${dayData.sales ? `<div class="day-sales">${dayData.sales} руб</div>` : ''}
            ${dayData.comment ? `<div class="day-comment">💬</div>` : ''}
        `;
        
        // Цвет фона
        if (dayData.color) {
            dayElement.style.backgroundColor = dayData.color;
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
        dayElement.addEventListener('click', () => openModal(day));
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
    // Добавить в конец setupEventListeners()
window.addEventListener('load', () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Запущено как PWA - браузерный интерфейс скрыт');
    }
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
    
    document.getElementById('sales-input').value = dayData.sales || '';
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
    document.getElementById('sales-input').focus();
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
    
    calendarData[dateKey] = {
        sales: salesValue,
        comment: document.getElementById('comment-input').value || '',
        color: selectedColor
    };
    
    // Сохранение в localStorage
    localStorage.setItem('calendarData', JSON.stringify(calendarData));
    
    // Обновление интерфейса
    generateCalendar();
    closeModal();
    
    // Уведомление о сохранении
    showNotification('Данные сохранены!');
}

// Расчет зарплаты (ИЗМЕНЕННЫЙ БЛОК)
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
    
    // ИЗМЕНЕННЫЕ РАСЧЕТЫ НАЧИНАЮТСЯ ЗДЕСЬ
    const totalEarnedBeforeTax = (totalSales * 0.07) + (workDays * 1000);
    const totalEarned = totalEarnedBeforeTax * 0.87; // Учет 13% налога
    const salary = totalEarned - 10875; // Зарплата после аванса
    const balance = salary - 10875; // Остаток после вычета оф. части
    // ИЗМЕНЕННЫЕ РАСЧЕТЫ ЗАКАНЧИВАЮТСЯ ЗДЕСЬ
    
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
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = '#4e73df';
    notification.style.color = 'white';
    notification.style.padding = '12px 25px';
    notification.style.borderRadius = '25px';
    notification.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1000';
    notification.style.transition = 'opacity 0.3s';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
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

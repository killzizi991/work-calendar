// script.js
// ... (существующий код)

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    generateCalendar();
    setupEventListeners();
    initPeriodSelector(); // Инициализация выбора периода
    
    // ... (остальной код)
});

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

// Настройка обработчиков событий
function setupEventListeners() {
    // ... (существующие обработчики)
    
    // Открытие выбора периода
    document.getElementById('month-year-selector').addEventListener('click', openPeriodModal);
    
    // Кнопка "Назад" в выборе периода
    document.getElementById('period-back').addEventListener('click', goBackToYears);
    
    // Закрытие модального окна периода
    document.querySelectorAll('.modal .close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // ... (остальные обработчики)
}

// ... (остальной код)

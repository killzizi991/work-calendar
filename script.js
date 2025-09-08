/* Сброс стилей */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
}

/* Базовые стили */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: #ffd5b8;
    min-height: 100vh;
    padding: 20px;
    color: #333;
    overflow-x: hidden;
}

/* Убираем скролл при открытом модальном окне */
body.modal-open {
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
}

/* Индикатор загрузки */
#app-loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #ffd5b8;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #333;
    font-size: 1.2rem;
    z-index: 9999;
}

/* Заголовок */
.header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.month-selector {
    flex: 1;
    text-align: center;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: bold;
    color: #2c3e50;
}

.tools-container {
    display: flex;
    gap: 10px;
    justify-content: center;
}

/* Кнопки */
button {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

button:active {
    transform: translateY(0);
}

.palette-btn.active {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

/* Календарь */
.calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
    margin-bottom: 20px;
}

.day-header {
    text-align: center;
    font-weight: bold;
    padding: 10px;
    color: #333;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    backdrop-filter: blur(10px);
}

.day {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 10px;
    padding: 10px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    min-height: 70px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.day:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.day.today {
    position: relative;
}

.day.today::after {
    content: '';
    position: absolute;
    top: 5px;
    right: 5px;
    width: 8px;
    height: 8px;
    background-color: #100cf7;
    border-radius: 50%;
}

.day.empty {
    background: rgba(255, 255, 255, 0.4);
    cursor: default;
}

.day-number {
    font-weight: bold;
    font-size: 1rem;
    margin-bottom: 4px;
}

.day-sales {
    font-size: 0.8rem;
    color: #666;
    word-break: break-word;
}

.day-comment {
    position: absolute;
    top: 5px;
    right: 5px;
    font-size: 0.75em;
}

/* Функциональная обводка */
.day.functional-border {
    border: 3px solid #e74c3c;
    animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
    0% { border-color: #e74c3c; }
    50% { border-color: #ff6b6b; }
    100% { border-color: #e74c3c; }
}

/* Панель инструментов */
.palette-panel {
    display: none;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
}

.palette-tools {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
}

.palette-tool {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    border: 2px solid transparent;
}

.palette-tool:hover {
    transform: scale(1.05);
}

.palette-tool.active {
    border: 2px solid #3498db;
    box-shadow: 0 0 10px rgba(52, 152, 219, 0.4);
}

/* Модальные окна */
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.modal-content {
    background: white;
    margin: 5% auto;
    padding: 20px;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    animation: slideIn 0.3s ease;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

@keyframes slideIn {
    from { transform: translateY(-40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.close {
    color: #aaa;
    float: right;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    position: absolute;
    top: 12px;
    right: 15px;
}

.close:hover {
    color: #000;
}

/* Поля ввода */
input, textarea {
    width: 100%;
    padding: 12px;
    margin: 8px 0;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
    background: #f8f9fa;
}

input:focus, textarea:focus {
    outline: none;
    border-color: #3498db;
    background: white;
    box-shadow: 0 0 8px rgba(52, 152, 219, 0.2);
}

/* Выбор цвета */
.color-picker {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin: 12px 0;
    flex-wrap: wrap;
}

.color-option {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
}

.color-option:hover {
    transform: scale(1.1);
}

.color-option.selected {
    border: 2px solid #2c3e50;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

/* Выбор периода */
.period-selector {
    text-align: center;
    background: #2c3e50;
    color: white;
    border-radius: 12px;
    padding: 15px;
}

.period-step h4 {
    margin-bottom: 12px;
    color: #3498db;
}

.period-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 15px;
}

.period-option {
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    color: white;
    transition: all 0.2s ease;
}

.period-option:hover {
    background: rgba(52, 152, 219, 0.7);
    transform: translateY(-1px);
}

/* Настройки */
.setting-group {
    margin: 12px 0;
}

.setting-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #333;
}

.setting-group input[type="number"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
}

.setting-group input[type="checkbox"] {
    margin-right: 8px;
    transform: scale(1.1);
}

/* Результаты расчетов */
.summary-results {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 12px;
    margin: 12px 0;
}

.summary-results p {
    margin: 8px 0;
    font-size: 1rem;
    display: flex;
    justify-content: space-between;
}

.summary-results span {
    font-weight: bold;
    color: #3498db;
}

/* Адаптивность */
@media (max-width: 768px) {
    body {
        padding: 10px;
    }
    
    .calendar {
        gap: 4px;
    }
    
    .day {
        min-height: 60px;
        padding: 8px;
    }
    
    .day-number {
        font-size: 0.9rem;
    }
    
    .day-sales {
        font-size: 0.7rem;
    }
    
    .modal-content {
        margin: 8% auto;
        width: 95%;
        padding: 15px;
    }
    
    .header {
        padding: 10px;
    }
    
    button {
        padding: 10px 15px;
        font-size: 0.8rem;
    }
    
    .period-options {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 480px) {
    .header-container {
        flex-wrap: wrap;
    }
    
    .tools-container {
        width: 100%;
        margin-top: 8px;
    }
    
    .day {
        min-height: 50px;
        padding: 6px;
    }
    
    .day-number {
        font-size: 0.85rem;
    }
    
    .period-options {
        grid-template-columns: 1fr;
    }
}

/* Портретный режим */
@media (orientation: portrait) {
    .calendar {
        grid-template-columns: repeat(7, 1fr);
    }
}

/* Ландшафтный режим */
@media (orientation: landscape) and (max-height: 500px) {
    .header {
        position: static;
    }
    
    .calendar {
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
    }
    
    .day {
        min-height: 35px;
        padding: 3px;
        font-size: 0.75rem;
    }
}

/* Высокие устройства (например, iPhone SE) */
@media (max-height: 700px) {
    .day {
        min-height: 55px;
    }
}

/* Очень высокие устройства */
@media (min-height: 1000px) {
    .day {
        min-height: 90px;
    }
}

/* Поддержка темной темы */
@media (prefers-color-scheme: dark) {
    body {
        background: #1a1a1a;
    }
    
    .modal-content {
        background: #2d3436;
        color: white;
    }
    
    input, textarea {
        background: #3b4144;
        border-color: #3498db;
        color: white;
    }
    
    .summary-results {
        background: #3b4144;
    }
}

/* Улучшенная поддержка мобильных устройств */
@supports (padding: max(0px)) {
    body {
        padding-left: max(10px, env(safe-area-inset-left));
        padding-right: max(10px, env(safe-area-inset-right));
        padding-top: max(10px, env(safe-area-inset-top));
        padding-bottom: max(10px, env(safe-area-inset-bottom));
    }
}

/* Анимации для улучшения UX */
.day {
    animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Улучшенная доступность */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* Подсветка фокуса для доступности */
button:focus-visible,
input:focus-visible,
textarea:focus-visible {
    outline: 2px solid #3498db;
    outline-offset: 2px;
}

/* Специфичные стили для iOS */
@supports (-webkit-touch-callout: none) {
    input, textarea {
        font-size: 16px; /* Предотвращает масштабирование в iOS */
    }
}

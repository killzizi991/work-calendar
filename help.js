const helpData = [
    {
        question: "Навигация по месяцам",
        answer: "Используйте кнопки 〈 и 〉 для перехода по месяцам. Для быстрого перехода к любому месяцу любого года нажмите на название текущего месяца и года в центре заголовка — откроется окно выбора периода. Сначала выберите год, затем месяц."
    },
    {
        question: "Ввод данных продаж за день",
        answer: "Просто нажмите на нужный день в календаре. В открывшемся окне в поле «Сумма продаж» введите числовое значение. Данные сохраняются автоматически после нажатия кнопки «Сохранить»."
    },
    {
        question: "Добавление комментариев к дням",
        answer: "В том же окне редактирования дня, где вы вводите сумму продаж, есть текстовое поле «Комментарий». Введите туда свой текст и сохраните. Дни с комментариями помечаются иконкой 💬."
    },
    {
        question: "Заливка дней цветом",
        answer: "В окне редактирования дня внизу есть палитра цветов. Нажмите на понравившийся цвет, чтобы выбрать его, и затем сохраните изменения. Цвет можно убрать, выбрав белый квадрат с рамкой."
    },
    {
        question: "Массовая заливка нескольких дней",
        answer: "Нажмите на кнопку «🎨» в верхней панели, чтобы открыть панель инструментов.\n\nВыберите нужный цвет, нажав на один из цветных квадратов (он подсветится).\n\nТеперь просто нажимайте на те дни в календаре, которые хотите залить этим цветом.\n\nЧтобы завершить режим массовой заливки, снова нажмите кнопку «🎨» или выберите другой инструмент."
    },
    {
        question: "Функциональная обводка дней",
        answer: "Это инструмент для планирования. При ее установке день автоматически заполняется суммой, указанной в настройках (по умолчанию 30 000 руб.).\nКак установить:\n\nНажмите на кнопку «🎨» в верхней панели.\n\nНа панели инструментов нажмите на кнопку «🔲» (Функциональная обводка). Она подсветится.\n\nТеперь нажмите на день в календаре, который хотите отметить. Он выделится pulsирующей красной рамкой, а в сумму продаж автоматически подставится значение из настроек.\n\nСовет: Используйте этот инструмент для быстрого планирования и моделирования своего заработка."
    },
    {
        question: "Расчет заработка и статистики",
        answer: "Нажмите кнопку «Расчеты» в верхней панели. Откроется окно с подробной статистикой за текущий месяц:\n\nРабочих дней: Количество дней, в которые внесена сумма продаж.\n\nСумма продаж: Общая выручка за все рабочие дни.\n\nЗаработано всего: Ваш заработок до вычетов (процент с продаж + ставки за смены).\n\nЗарплата: Итоговая сумма к получению (Заработано всего - Аванс).\n\nОстаток: Актуально для официального режима. Показывает разницу между Зарплатой и Фиксированной частью."
    },
    {
        question: "Два режима работы (Официальный/Неофициальный)",
        answer: "Официальный режим: Расчеты ведутся с учетом налога (НДФЛ 13%) и фиксированных вычетов. В итоге вы видите «чистую» зарплату, как в бухгалтерии.\n\nНеофициальный режим: Упрощенный расчет. Просто ваш процент с продаж плюс ставка за смену минус выданный аванс.\nПереключить режим можно в «Настройках»."
    },
    {
        question: "Настройки приложения",
        answer: "Нажмите на кнопку «⚙️» в правом верхнем углу. Откроются настройки приложения. Здесь вы можете:\n\nВыбрать Режим работы.\n\nЗадать общий Процент с продаж.\n\nУстановить Ставку за смену.\n\nУказать сумму Аванса.\n\nДля официального режима — указать Фиксированную часть зарплаты.\n\nЗадать значение для Функциональной обводки.\nНе забудьте нажать «Сохранить настройки»."
    },
    {
        question: "Индивидуальные настройки для дня",
        answer: "Для любого дня можно задать персональные значения, которые переопределят общие настройки.\n\nОткройте окно редактирования нужного дня.\n\nНажмите на кнопку «⚙️ Настройки дня».\n\nВ открывшейся панели введите:\n\nПроцент с продаж (%) для этого дня.\n\nФиксированный выход (руб) для этого дня.\n\nЭти значения будут использоваться при расчетах вместо общих. Чтобы сбросить их и использовать общие настройки, нажмите «Сбросить к общим»."
    }
];

function initHelpModal() {
    const helpModal = document.createElement('div');
    helpModal.id = 'help-modal';
    helpModal.className = 'modal';
    helpModal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; max-height: 80vh;">
            <span class="close">&times;</span>
            <h3>Помощь по приложению</h3>
            <div id="help-accordion" style="margin-top: 20px;"></div>
        </div>
    `;
    document.body.appendChild(helpModal);

    const helpAccordion = document.getElementById('help-accordion');
    helpData.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'help-item';
        itemElement.style.marginBottom = '10px';
        itemElement.style.border = '1px solid #e2e8f0';
        itemElement.style.borderRadius = '5px';
        itemElement.style.overflow = 'hidden';
        
        const questionElement = document.createElement('div');
        questionElement.className = 'help-question';
        questionElement.textContent = item.question;
        questionElement.style.padding = '12px 15px';
        questionElement.style.backgroundColor = '#f8fafc';
        questionElement.style.cursor = 'pointer';
        questionElement.style.fontWeight = '600';
        questionElement.style.display = 'flex';
        questionElement.style.justifyContent = 'space-between';
        questionElement.style.alignItems = 'center';
        questionElement.innerHTML = `${item.question} <span style="font-size: 1.2em;">+</span>`;
        
        const answerElement = document.createElement('div');
        answerElement.className = 'help-answer';
        answerElement.textContent = item.answer;
        answerElement.style.padding = '0 15px';
        answerElement.style.maxHeight = '0';
        answerElement.style.overflow = 'hidden';
        answerElement.style.transition = 'max-height 0.3s ease, padding 0.3s ease';
        answerElement.style.backgroundColor = '#ffffff';
        answerElement.style.whiteSpace = 'pre-line';
        answerElement.style.overflowY = 'auto';
        
        questionElement.addEventListener('click', () => {
            const isOpen = answerElement.style.maxHeight !== '0px';
            if (isOpen) {
                answerElement.style.maxHeight = '0';
                answerElement.style.padding = '0 15px';
                questionElement.querySelector('span').textContent = '+';
            } else {
                answerElement.style.maxHeight = '200px';
                answerElement.style.padding = '15px';
                questionElement.querySelector('span').textContent = '-';
            }
        });
        
        itemElement.appendChild(questionElement);
        itemElement.appendChild(answerElement);
        helpAccordion.appendChild(itemElement);
    });

    // Обработчики для модального окна
    helpModal.querySelector('.close').addEventListener('click', () => {
        helpModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    });

    return helpModal;
}

function showHelpModal() {
    let helpModal = document.getElementById('help-modal');
    if (!helpModal) {
        helpModal = initHelpModal();
    }
    helpModal.style.display = 'block';
    document.body.classList.add('modal-open');
}

// Добавляем стили для help модального окна
const helpStyles = `
.help-item {
    transition: all 0.3s ease;
}

.help-item:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.help-question:hover {
    background-color: #edf2f7 !important;
}

.help-answer {
    max-height: 200px;
    overflow-y: auto;
}

@media (prefers-color-scheme: dark) {
    .help-question {
        background-color: #3b3e45 !important;
        color: #e9ecef;
    }
    
    .help-answer {
        background-color: #2d3035 !important;
        color: #e9ecef;
    }
    
    .help-question:hover {
        background-color: #4a4d55 !important;
    }
}
`;

// Добавляем стили в документ
const styleElement = document.createElement('style');
styleElement.textContent = helpStyles;
document.head.appendChild(styleElement);

// Инициализация Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.expand();
}

// URL бэкенда через Cloudflare
const BACKEND_URL = 'https://homiq.21ci.uz';

// Получаем элементы интерфейса
const searchInput = document.getElementById('queryInput');
const searchForm = document.getElementById('searchForm');
const resultsDiv = document.getElementById('result');
const voiceBtn = document.getElementById('voiceBtn');
const themeToggle = document.getElementById('themeToggle');

// Блок загрузки
const loadingDiv = document.createElement('div');
loadingDiv.id = 'loading';
loadingDiv.style.display = 'none';
loadingDiv.textContent = 'Загрузка...';
document.body.appendChild(loadingDiv);

// Функция для показа/скрытия загрузки
function toggleLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
    const submitBtn = searchForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = show;
}

// Функция для отображения результатов
function showResults(result) {
    resultsDiv.innerHTML = `
        <div class="result-card">
            <h3>Результаты поиска</h3>
            <p>${result}</p>
        </div>
    `;
}

// Функция для отображения ошибки
function showError(message) {
    resultsDiv.innerHTML = `
        <div class="error-card">
            <h3>Ошибка</h3>
            <p>${message}</p>
        </div>
    `;
}

// Голосовой ввод
function startVoiceInput() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "ru-RU";

    recognition.onstart = function () {
        searchInput.placeholder = "Слушаю...";
    };

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        searchForm.dispatchEvent(new Event("submit")); // Автоматический запуск поиска
    };

    recognition.onerror = function (event) {
        console.error("Ошибка распознавания речи:", event.error);
        searchInput.placeholder = "Поиск...";
    };

    recognition.onend = function () {
        searchInput.placeholder = "Поиск...";
    };

    recognition.start();
}

// Отправка запроса к бэкенду
async function sendSearchRequest(query) {
    try {
        toggleLoading(true);
        console.log('Отправка запроса:', query);

        const response = await fetch(`${BACKEND_URL}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ prompt: query })
        });

        console.log('Ответ получен:', response.status);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Ответ от сервера:', data);

        if (typeof data.error === 'undefined') {
          showResults(data.reply ?? "🤖 Я не нашёл ничего подходящего.");
        } else {
          showError("Возникла ошибка! Текст: "+data.error);  
        }
""
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        showError('Произошла ошибка при выполнении запроса. Пожалуйста, попробуйте позже.');
    } finally {
        toggleLoading(false);
    }
}

// Обработчик отправки формы
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) {
        showError('Пожалуйста, введите запрос');
        return;
    }
    await sendSearchRequest(query);
});

// Кнопка голосового ввода
voiceBtn.addEventListener("click", function () {
    startVoiceInput();
});

// Переключение темы
themeToggle.addEventListener("change", function () {
    document.body.classList.toggle("dark-mode", this.checked);
});

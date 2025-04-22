import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai

# Инициализируем FastAPI приложение
app = FastAPI()

# Включаем CORS (разрешает кросс-доменные запросы, чтобы фронтенд общался с бэкендом)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Лучше указать конкретные хосты в проде
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Класс для запроса, который ожидает JSON с полем prompt
class SearchRequest(BaseModel):
    prompt: str

# Устанавливаем ключ API из переменной окружения
openai_api_key = os.getenv("OPENAI_API_KEY")

# Проверка: если ключ не установлен, выводим предупреждение
if not openai_api_key:
    logging.warning("❗ Переменная окружения OPENAI_API_KEY не установлена!")

# Создаем клиента OpenAI (новый синтаксис с openai>=1.0.0)
client = openai.OpenAI(api_key=openai_api_key)

@app.post("/search")
async def search_real_estate(request: SearchRequest):
    try:
        # Формируем запрос к ChatGPT
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Ты агент по недвижимости. Помоги найти подходящий вариант по описанию клиента."},
                {"role": "user", "content": request.prompt}
            ]
        )

        # Достаём ответ из структуры ответа
        message = response.choices[0].message.content
        return {"result": message}

    except Exception as e:
        # Если ошибка — логируем её и возвращаем заглушку
        logging.error(f"🔥 Ошибка запроса к OpenAI: {e}\n")
        return {"error": "Произошла ошибка. Проверь ключ OpenAI и лог."}


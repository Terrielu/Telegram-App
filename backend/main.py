from fastapi import FastAPI, Request
from pydantic import BaseModel
import os
from openai import OpenAI
import logging

# Логгер (по желанию)
logging.basicConfig(level=logging.INFO)

# Получаем API-ключ
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    logging.warning("❗ Переменная окружения OPENAI_API_KEY не установлена!")

# Создаём клиента
client = OpenAI(api_key=api_key)

# Инициализация FastAPI
app = FastAPI()

# Схема тела запроса
class PromptRequest(BaseModel):
    prompt: str

@app.post("/search")
async def search(request: Request, body: PromptRequest):
    user_ip = request.client.host
    user_prompt = body.prompt
    logging.info(f"📨 Запрос от IP {user_ip}: {user_prompt}")

    try:
        # Отправляем в OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Ты ассистент, помогающий найти жильё."},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
        )

        reply = response.choices[0].message.content
        logging.info(f"✅ Ответ от OpenAI: {reply}")
        return {"reply": reply}

    except Exception as e:
        logging.error(f"🔥 Ошибка при обращении к OpenAI: {e}")
        return {"error": str(e)}

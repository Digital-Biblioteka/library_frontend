FROM node:20-alpine

WORKDIR /app

# Копируем файлы зависимостей (чтобы кешировать слой)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci || npm install

# Копируем исходный код (если не используете volume)
COPY . .

# Открываем порт React dev-сервера
EXPOSE 3000

# Переменные окружения (можно переопределить при запуске)
ENV HOST=0.0.0.0
ENV CHOKIDAR_USEPOLLING=true

# Запуск dev-сервера
CMD ["sh", "-c", "npm start"]
# О проекте

Тестовое задание с использованием Express.js, TypeScript, TypeORM и SQLite.

## Системные требования

- Node.js (v18.18 или выше)
- npm

## Установка

1. Клонировать репозиторий:
```bash
git clone https://github.com/tauraloke/user-express.git
cd user-express
```

2. Установить зависимости:
```bash
npm install
```

3. Установить переменные окружения:
Скопировать `.env` и отредактировать его по своему контексту:
```bash
cp .env.example .env
```

4. Запуск сервера разработки:
```bash
npm run dev
```

## Эндпойнты API

### Аутентификация

- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Инфо о текущем пользователе (аутентифицированного)

### Пользователи

- `GET /api/users` - Список всех пользователей (только для админа)
- `GET /api/users/:id` - Пользователь по ID (админ или сам пользователь)
- `PATCH /api/users/:id/block` - Блокировка (админ или сам пользователь)

## Модель пользователя

```typescript
{
  id: string (UUID)
  firstName: string
  lastName: string
  middleName: string
  birthDate: Date
  email: string (unique)
  password: string (hashed)
  role: 'admin' | 'user'
  status: 'active' | 'blocked'
  createdAt: Date
  updatedAt: Date
}
```

## Доступные команды

- `npm run dev` - Запуск сервера
- `npm run build` - Сборка сервера для продакшна
- `npm start` - Запуск сервера для продакшна
- `npm run lint` - Запуск ESLint
- `npm run lint:fix` - Исправление ошибок через ESLint
- `npm test` - Запуск тестов
- `npm run test:coverage` - Генерация отчёта о покрытии кода тестами
- `npm run test:watch` - Тесты в режиме отслеживания

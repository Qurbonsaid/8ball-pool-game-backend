# 8ball pool game

## Getting Started

1. First, create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

2. Fill out the database variables on `.env` file:

```bash
# SERVER
PORT = 8080
CURRENT_MODE = DEVELOPMENT

# DB
DB_LOCAL = mongodb://localhost:27017/8ball_pool
DB_PROD = mongodb://localhost:27017/8ball_pool
```

3. Install dependencies:

```bash
yarn
```

4. Then, run the development server:

```bash
yarn dev
```

🎉 Finally now your server is running on `http://localhost:8080`

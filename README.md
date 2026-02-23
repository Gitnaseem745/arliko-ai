# Arliko AI

A simple AI chatbot web app powered by Google's Gemini 2.5 Flash model. Built with Express, MongoDB, and vanilla JS.

## Tech Stack

- **Backend:** Express 5, Mongoose, Google Generative AI SDK
- **Frontend:** Vanilla HTML/CSS/JS
- **Database:** MongoDB
- **AI Model:** Gemini 2.5 Flash

## Setup

1. Clone the repo

```bash
git clone https://github.com/Gitnaseem745/arliko-ai.git
cd arliko-ai
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root directory

```
PORT=3000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

4. Start the server

```bash
node backend/server.js
```

The app will be running at `http://localhost:3000`.

## Project Structure

```
backend/
  app.js            - Express app setup
  server.js         - Entry point
  config/           - DB and env config
  controllers/      - Route handlers
  middlewares/       - Error handling
  models/           - Mongoose schemas
  routes/           - API routes
  services/         - Gemini AI integration
public/             - Frontend (HTML, CSS, JS)
```

## API Endpoints

- `GET /api/chat/:chatId` — Get conversation by ID
- `POST /api/chat/:chatId` — Send a message and get AI response

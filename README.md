# Arliko AI

A full-stack AI chatbot web app powered by Google's Gemini 2.5 Flash model. Built with Express 5, MongoDB, and vanilla JS. Features a ChatGPT-style dark UI with sidebar, markdown rendering, syntax-highlighted code blocks, auto-generated chat titles, and API rate limiting.

## Tech Stack

- **Backend:** Express 5, Mongoose 9, Google Generative AI SDK, bcrypt, morgan, express-rate-limit
- **Frontend:** Vanilla HTML/CSS/JS, marked.js, DOMPurify, highlight.js
- **Database:** MongoDB
- **AI Model:** Gemini 2.5 Flash

## Features

- AI-powered chat using Gemini 2.5 Flash with conversation history
- Auto-generated chat titles from the first message
- Markdown rendering with syntax-highlighted code blocks
- ChatGPT-style dark theme UI
- Sidebar with conversation list and new chat button
- Inline edit and delete conversations
- SPA-style client-side routing (`/chat/:chatId`)
- User signup and login with bcrypt password hashing
- Per-user conversation storage
- API rate limiting (general + AI-specific)
- CORS configuration
- Responsive design with mobile sidebar toggle

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

3. Create a `.env` file in the root directory (see `.env.example`)

```
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:3000
```

4. Start the server

```bash
npm start
```

The app will be running at `http://localhost:3000`.

## Project Structure

```
backend/
  app.js              - Express app setup, CORS, rate limiting, static serving
  server.js           - Entry point, DB connection, DNS config
  config/
    database.js       - MongoDB connection via Mongoose
    env.js            - Environment variable loader (PORT, MONGO_URI, GEMINI_API_KEY, CLIENT_URL)
  controllers/
    auth.controller.js - Signup and login handlers
    chat.controller.js - Chat CRUD, AI response, auto-title generation
  middlewares/
    error.middleware.js - Global error handler (catches ValidationError)
  models/
    user.model.js       - User schema (email, passwordHash, username)
    conversation.model.js - Conversation schema (userId, title, messages[])
  routes/
    auth.routes.js     - Auth routes (/api/signup, /api/login)
    chat.routes.js     - Chat routes with AI rate limiter on POST
  services/
    ai.service.js      - Gemini AI integration (chat response + title generation)
  utils/
    checkParams.js     - Reusable param validation (objectId, required, minLength)
    limiters.js        - Rate limiters (general API + AI-specific)
public/
  index.html           - Chat UI with sidebar, auth modal
  app.js               - Client-side routing, fetch calls, markdown rendering, inline title edit
  style.css            - Dark theme, responsive layout, code block styles
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/signup` | Register a new user |
| `POST` | `/api/login` | Login with email and password |
| `GET` | `/api/chat/:userId` | Get all conversations for a user |
| `GET` | `/api/chat/:userId/:chatId` | Get a single conversation |
| `POST` | `/api/chat/:userId/:chatId` | Send a message and get AI response (rate limited) |
| `PUT` | `/api/chat/:userId/:chatId` | Edit conversation title |
| `DELETE` | `/api/chat/:userId/:chatId` | Delete a conversation |

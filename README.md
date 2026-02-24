# Arliko AI

A full-stack AI chatbot web app powered by Google's Gemini 2.5 Flash model. Built with Express, MongoDB, and vanilla JS. Features a ChatGPT-style dark UI with sidebar, markdown rendering, and syntax-highlighted code blocks.

## Tech Stack

- **Backend:** Express 5, Mongoose 9, Google Generative AI SDK, bcrypt
- **Frontend:** Vanilla HTML/CSS/JS, marked.js, DOMPurify, highlight.js
- **Database:** MongoDB
- **AI Model:** Gemini 2.5 Flash

## Features

- AI-powered chat with conversation history
- Markdown rendering with syntax-highlighted code blocks
- ChatGPT/Gemini-style dark theme UI
- Sidebar with conversation list and new chat button
- SPA-style client-side routing (`/chat/:chatId`)
- User signup and login (bcrypt password hashing)
- Responsive design (mobile sidebar toggle)

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
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

4. Start the server

```bash
npm start
```

The app will be running at `http://localhost:3000`.

## Project Structure

```
backend/
  app.js              - Express app setup, static serving, SPA route
  server.js           - Entry point, DB connection, DNS config
  config/
    database.js       - MongoDB connection via Mongoose
    env.js            - Environment variable loader
  controllers/
    auth.controller.js - Signup and login handlers
    chat.controller.js - Chat CRUD and AI response handlers
  middlewares/
    error.middleware.js - Global error handler
  models/
    user.model.js       - User schema (email, passwordHash, username)
    conversation.model.js - Conversation schema (title, messages)
  routes/
    auth.routes.js     - Auth routes (/api/signup, /api/login)
    chat.routes.js     - Chat routes (/api/chat, /api/chats)
  services/
    ai.service.js      - Gemini AI integration
public/
  index.html           - Chat UI with sidebar
  app.js               - Client-side routing, fetch calls, markdown rendering
  style.css            - Dark theme, responsive layout, code block styles
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/signup` | Register a new user |
| `POST` | `/api/login` | Login with email and password |
| `GET` | `/api/chats` | Get all conversations (id + title) |
| `GET` | `/api/chat/:chatId` | Get a single conversation |
| `POST` | `/api/chat/:chatId` | Send a message and get AI response |

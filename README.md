# Arliko AI

A full-stack AI chatbot web app powered by Google's Gemini 2.5 Flash model. Built with Express 5, MongoDB, and vanilla JS. Features a ChatGPT-style dark UI with sidebar, markdown rendering, syntax-highlighted code blocks, auto-generated chat titles, JWT-based auth, and API rate limiting.

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
 - Streamed AI responses (streamline messaging) with progressive rendering

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
MONGO_URI=your-mongo-db-uri
GEMINI_API_KEY=your-gemini-api-key
CLIENT_URL=your-client-url
JWT_SECRET=your-jwt-secret
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
| `POST` | `/api/signup` | Register a new user — returns `token` and `userId` |
| `POST` | `/api/login` | Login with email and password — returns `token`, `userId`, `username` |
| `GET` | `/api/chats` | Get all conversations for the authenticated user (use `Authorization: Bearer <token>`) |
| `GET` | `/api/chat/:chatId` | Get a single conversation (authenticated) |
| `POST` | `/api/chat/:chatId` | Send a message and get AI response (rate limited, authenticated) |
| `PUT` | `/api/chat/:chatId` | Edit conversation title (authenticated) |
| `DELETE` | `/api/chat/:chatId` | Delete a conversation (authenticated) |
| `GET` | `/api/chat/stream/:chatId` | SSE streaming response for a message — pass either `Authorization: Bearer <token>` header or `?token=<token>` query parameter |

Notes:
- Auth is JWT-based. After `signup`/`login` the server returns a signed token which the client stores and sends in `Authorization` header for subsequent API requests.
- For Server-Sent-Events (EventSource) the token is also accepted via the `token` query parameter to work around EventSource header limitations.
- Message length is validated (max 100KB) on both frontend and backend to prevent very large payloads being sent to the AI backend.

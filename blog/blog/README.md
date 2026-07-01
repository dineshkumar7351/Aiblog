# AI-Assisted Blogging Platform

A modern AI-powered blogging platform built with React, Node.js, Express, MongoDB, and Groq AI.

## Features

- 🔐 JWT Authentication (Register/Login)
- ✍️ Rich Blog Editor
- 🤖 AI Assistant Panel (Suggest Title, Improve Content, SEO Check)
- 📊 Dashboard & Analytics
- 🌙 Dark Mode Support
- 📱 Responsive Design
- 🔗 LinkedIn OAuth connect + post on publish

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Groq API (LLaMA/Mixtral)

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Groq API Key
- LinkedIn Developer App (OAuth 2.0)

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```
4. Create `.env` file in server folder (see `.env.example`)
5. Start MongoDB
6. Run backend: `npm run dev` (in server folder)
7. Run frontend: `npm run dev` (in client folder)

## LinkedIn OAuth Setup

1. In LinkedIn Developer Portal, configure your app OAuth redirect URL:
   - `http://localhost:5000/api/linkedin/callback`
2. Add these values to `server/.env`:
   - `LINKEDIN_CLIENT_ID`
   - `LINKEDIN_CLIENT_SECRET`
   - `LINKEDIN_REDIRECT_URI`
   - `LINKEDIN_SCOPES=openid profile w_member_social`
3. Ensure `CLIENT_URL` matches your frontend URL (default: `http://localhost:5173`).
4. Flow behavior:
   - First click on LinkedIn share prompts OAuth consent.
   - Access token is cached server-side and reused until expiry.
   - Publishing a blog automatically attempts a LinkedIn post.
   - If token is expired/invalid, blog publish still succeeds and returns a warning.

## Project Structure

```
blog/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context (Auth)
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utility functions
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Business logic & AI
│   ├── utils/              # Utility functions
│   └── package.json
│
└── README.md
```

## License
MIT

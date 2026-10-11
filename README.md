# Internship Portal

A full-stack internship portal built with React, Vite, Node.js, Express, MongoDB, and JWT authentication.

## Features
- Register and log in with JWT authentication
- Password hashing with bcrypt
- Protected profile endpoint
- Browse internship listings
- Create internship listings (admin role)
- Apply to internships (authenticated users)
- View your own applications
- Responsive React UI

## Requirements
- Node.js 20+
- MongoDB running locally or a MongoDB Atlas connection string

## 1. Configure the backend
```bash
cd server
cp .env.example .env
```
Set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` in `server/.env`. Use a long random JWT secret. Never commit `.env`.

## 2. Install and start the backend
```bash
npm install
npm run dev
```
API runs at `http://localhost:5000`.

## 3. Configure and start the frontend
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the Vite URL printed in the terminal (usually `http://localhost:5173`).

## Demo admin
Register normally, then promote your user in MongoDB for development:
```js
use internship_portal
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```
Never expose a public endpoint that lets users promote themselves to admin.

## API routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (JWT required)
- `GET /api/internships`
- `GET /api/internships/:id`
- `POST /api/internships` (admin JWT required)
- `POST /api/internships/:id/apply` (JWT required)
- `GET /api/applications/mine` (JWT required)

## Production security notes
This starter stores the JWT in `localStorage` for demo simplicity. For a production deployment, prefer a short-lived access token with a refresh strategy and secure, HttpOnly, SameSite cookies where appropriate, plus CSRF protections. Add email verification, rate limiting, audit logging, validation, and HTTPS before public launch.

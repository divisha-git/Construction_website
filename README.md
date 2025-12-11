# Construction Auth Starter

Full-stack starter with professional Login/Signup.

- Server: Node/Express + Prisma + PostgreSQL + JWT
- Client: React + Vite + Tailwind (shadcn-style)

## Setup

1. Install dependencies
   - Server
     - cd server && npm install
   - Client
     - cd client && npm install

2. Configure environment
   - Copy `server/.env.example` to `server/.env` and set `DATABASE_URL` and `JWT_SECRET`.

3. Initialize database
   - In `server`: `npx prisma generate` then `npx prisma migrate dev --name init`

4. Run
   - Start server: `npm run dev` in `server`
   - Start client: `npm run dev` in `client`

The client proxies `/api` to `http://localhost:4000`.

## API
- POST `/api/auth/signup` { email, password, name? }
- POST `/api/auth/login` { email, password }

Responses include `{ token, user }`.

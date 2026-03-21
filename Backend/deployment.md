# Deployment Guide

## Prerequisites
- Node.js v18 or later
- npm or yarn
- Optional: PostgreSQL database (can use default SQLite for testing without external dependencies).

## Local Development
1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup the Database**
   By default, the backend uses SQLite.
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Start the Development Server**
   ```bash
   npm run build
   npm start
   ```
   Or use `ts-node`:
   ```bash
   npx ts-node src/index.ts
   ```
   The API will be available at `http://localhost:3000`.

## Production Deployment
For production, it is recommended to switch the database to PostgreSQL:
1. Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`.
2. Update the `DATABASE_URL` in `.env` to point to your Postgres instance.
3. Run `npx prisma db push` to initialize the tables.
4. Build the typescript project `npx tsc`.
5. Run the compiled code using `node dist/index.js` or via a process manager like PM2.

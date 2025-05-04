# Ratehub - Server

This is the **backend** of the Ratehub application built using **Express.js**, **Node.js**, and **PostgreSQL** with **Prisma ORM**.

## 🔧 Technologies Used

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- CORS
- dotenv


## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd server
npm install

```

### 2. Initialize Prisma
```bash
npx prisma migrate dev --name init
npx prisma generate

```
### 3. Run the server
```bash
npm run dev
```

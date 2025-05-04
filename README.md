

### ✅ `server/README.md`

# ⚙️ Ratehub - Server

This is the **backend** of the Ratehub application, built using **Express.js**, **Node.js**, and **PostgreSQL**, with **Prisma ORM** for DB modeling.

## 🌐 Live Demo

[🔗 Demo Video](https://www.loom.com/share/fb6385215f694fb383be8483e262a9b8?sid=e3748cd1-82a0-4a19-a1f1-384ce498bbc1)

---

## 🧰 Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- dotenv
- CORS

---

## 🚀 Getting Started

### 📁 Clone the Repository

```bash
git clone https://github.com/yourusername/Ratehub.git
cd Ratehub/server
```
### Install Dependencies
```bash
npm install
```

Setup Environment Variables
Create a .env file in the root of the server folder with:

```env

DATABASE_URL="postgresql"
JWT_SECRET="your_key"
```

### Prisma Setup
Run migrations and generate Prisma client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Run the Server
```bash
npm run dev
```

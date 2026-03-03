#  Campus Club API

Backend API for the Campus Club system built with:

* Node.js
* Express.js
* MongoDB Atlas

Architecture Pattern:

Route → Controller → Service → Model

---

# 📁 Project Structure

```
src
│
├── app.js
├── server.js
│
├── routes
├── controllers
├── services
├── models
├── config
```

---

# ⚙️ Setup Instructions

## 1️⃣ Clone the repository

```
git clone https://github.com/yuosef33/Campus-club-system-backend

```

---

## 2️⃣ Install dependencies

```
npm install
```

---

## 3️⃣ Create `.env` file in root folder

Create a file named:

```
.env
```

Add the following:

```
PORT=3000
MONGO_URI=your_mongodb_connection_string
```

⚠️ IMPORTANT:

* Do NOT push `.env` to GitHub.

---

## 4️⃣ Run the server

Development mode:

```
npm run dev
```

Production mode:

```
npm start
```

Server runs on:

```
http://localhost:3000
```

---

# 👥 Team Workflow (IMPORTANT)

🚫 DO NOT push directly to `main`.

Everyone must work on their own branch.

---

## 🧑‍💻 Working Steps

### 1️⃣ Pull latest main before starting

```
git checkout main
git pull origin main
```

### 2️⃣ Create your own branch

Branch naming format:

```
feature/your-name
```

Example:

```
git checkout -b feature/ahmed
```

---

### 3️⃣ After finishing your work

```
git add .
git commit -m "Add user service logic"
git push origin feature/ahmed
```

---

### 4️⃣ Open Pull Request

* Go to GitHub
* Open a Pull Request
* Request review
* Merge after approval

---

# 🚀 Secure Web Application with EJS & MongoDB

## 📌 Project Overview
This is a secure and interactive web application built with **Node.js**, **Express.js**, **EJS**, and **MongoDB Atlas**. It includes **user authentication**, **session management**, and **secure deployment** using **Docker** and **Railway**.

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Frontend:** EJS, Bootstrap
- **Database:** MongoDB Atlas
- **Authentication:** bcrypt, express-session
- **Deployment:** Docker, Railway

---

## 🚀 Local Setup

### 1️⃣ Clone Repository
```sh
git clone https://github.com/CodeWizardMagic/assignment4
cd repo
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file in the root folder and add:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
```

### 4️⃣ Run the Application
```sh
npm start
```
Visit `http://localhost:3000` in your browser.

---

## 🐳 Deployment with Docker

### 1️⃣ Build and Run Docker Container
```sh
docker build -t myapp .
docker run -p 3000:3000 --env-file .env myapp
```

---

## 🚀 Deploy to Railway

### 1️⃣ Create a Railway Project
- Go to [Railway](https://railway.app/) and sign in with GitHub.
- Click **New Project → Deploy from GitHub Repo**.

### 2️⃣ Add Environment Variables
- In Railway, go to **Settings → Variables** and add:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
```

### 3️⃣ Deploy
Railway will automatically detect the `Dockerfile` and deploy the application.

### 4️⃣ Get Public URL
Once deployed, Railway will provide a public URL like:
```
https://your-app-name.up.railway.app/
```

Open it in your browser to test your app!

---

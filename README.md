# 🚀 TaskFlow

TaskFlow is a visual project management web application featuring interactive Kanban boards, seamless drag-and-drop tasks, theme switching, and real-time settings updating. 

This project uses **MongoDB Atlas** for data persistence and **Firebase Authentication** (supporting Email/Password and Google Sign-In) for secure user sessions.

---

## 🏗️ Tech Stack
* **Frontend**: React, Vite, Framer Motion, Lucide Icons, TailwindCSS
* **Backend**: Express, Node.js, MongoDB (Mongoose)
* **Auth**: Firebase Authentication SDK (Client) & Firebase Admin SDK (Server)

---

## 🛠️ Step-by-Step Installation & Setup

### 1. Install Dependencies
You need to install the dependencies in both the root folder (frontend) and the `server` folder (backend).

* **In the project root folder (Frontend)**:
  ```bash
  npm install
  ```

* **In the `server` folder (Backend)**:
  ```bash
  cd server
  npm install
  cd ..
  ```

---

### 2. Configure Firebase Authentication

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project named **TaskFlow** (or any name you prefer).
3. Navigate to **Authentication** under the *Build* menu and click **Get Started**.
4. Enable the following Sign-In Providers:
   * **Email/Password**
   * **Google**
5. Register a **Web App** in your Firebase project (Click the gear icon next to *Project Overview* -> *Project Settings* -> *Add App* -> select `</>` Web).
6. Copy the Firebase configuration object keys and place them in the root `.env` file.

---

### 3. Setup MongoDB Atlas Database

1. Create a free account or log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (the free shared tier is perfect).
3. Under **Security** -> **Database Access**: Create a database user with read/write privileges and copy their credentials.
4. Under **Security** -> **Network Access**: Add a new IP access rule:
   * Select **Allow Access From Anywhere** (`0.0.0.0/0`) or **Add Current IP Address** to whitelist your local environment.
5. Under **Deployment** -> **Database**: Click **Connect** -> **Drivers** -> Copy the connection string.
6. Paste the connection string into your `server/.env` file.

---

### 4. Create Environment Variables Configuration

Create and fill out the configuration values in the following files:

#### Frontend Environment variables
Create a file named `.env` in the root folder of the project:
```env
# Firebase Configuration settings
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID

# Backend API endpoint URL
VITE_API_URL=http://localhost:5000/api
```

#### Backend Environment variables
Modify the file named `.env` in the `server` folder:
```env
PORT=5000
MONGODB_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING
FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
```

---

## 🏃 Running the Application

For a fully working environment, run both client and server simultaneously.

### Start the Backend Server
Navigate to the `server` directory and run:
```bash
cd server
npm run dev
```
*The server will run on `http://localhost:5000`. Once connected to MongoDB, it will print: `MongoDB Connected successfully to ...`*

### Start the React Frontend
Open a separate terminal in the root directory and run:
```bash
npm run dev
```
*Vite will compile and serve the application on `http://localhost:5173`.*

---

## 🔍 Verification Checklist

1. **Database Access**: Verify that your backend starts up with no error and logs connection to MongoDB Atlas.
2. **User Sign Up**: Navigate to `/signup` on the frontend, create an account, and confirm that:
   * The user profile appears in the Firebase Auth console list.
   * A matching user document has been automatically created in your MongoDB Atlas database collection (`users`).
3. **Google Sign-In**: Click **Sign in with Google** to test OAuth popup flow.
4. **Data Persistence**: Create a new Board or task, drag-and-drop them to different columns, and refresh the page. Your progress will remain intact, loaded dynamically from MongoDB Atlas!

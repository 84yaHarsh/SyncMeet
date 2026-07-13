# 🎥 SyncMeet – Real-Time Video Conferencing Platform

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![Socket.IO](https://img.shields.io/badge/Socket.IO-RealTime-black?style=for-the-badge&logo=socket.io)
![WebRTC](https://img.shields.io/badge/WebRTC-P2P-blue?style=for-the-badge)
![JWT](https://img.shields.io/badge/Auth-JWT-green?style=for-the-badge)
![Google OAuth](https://img.shields.io/badge/Login-Google%20OAuth-red?style=for-the-badge&logo=google)

**A modern, production-inspired video conferencing platform built with React, Node.js, Socket.IO and WebRTC.**

</div>

---

## 🚀 Live Demo

> **Frontend:** Coming Soon

> **Backend:** Coming Soon

---

## 📸 Screenshots

> Add screenshots after deployment.

### Landing Page
 
 ![Landing](./screenshots/landing.png)

### Dashboard

![Dashboard](./screenshots/dashboard.png)

### Meeting Room

![Meeting](./screenshots/meeting.png)

---

# ✨ Features

- 🔐 Secure Google OAuth Authentication
- 🎥 HD Video & Audio Calling
- 👥 Create & Join Meetings
- 📺 Screen Sharing
- 💬 Real-Time Chat
- 🎤 Mute / Unmute Microphone
- 📷 Camera On / Off
- 👤 Live Participant List
- ⏱ Meeting Timer
- 📋 Copy Meeting Link
- 🔗 Share Meeting Code
- 🚪 Leave Meeting
- 📱 Fully Responsive UI
- 🌙 Modern Glassmorphism Design

---

# 🛠 Tech Stack

## Frontend

- React 19
- Vite
- Tailwind CSS v4
- React Router
- Google OAuth
- Socket.IO Client
- Simple Peer
- WebRTC

## Backend

- Node.js
- Express.js
- Socket.IO
- JWT Authentication
- Google Auth Library
- Zod Validation
- Helmet
- Express Rate Limit

---

# 🏗 Architecture

```
                Google OAuth
                      │
                      ▼
              React Frontend
                      │
              JWT Authentication
                      │
                      ▼
           Express + Socket.IO Server
             │                  │
             │                  │
             ▼                  ▼
      Meeting APIs        WebRTC Signaling
                                 │
                                 ▼
                     Peer-to-Peer Connection
                                 │
                     Video • Audio • Chat
```

---

# 📂 Project Structure

```
SyncMeet
│
├── client
│   ├── src
│   ├── public
│   └── package.json
│
├── server
│   ├── controllers
│   ├── middlewares
│   ├── routes
│   ├── socket
│   └── package.json
│
└── README.md
```

---

# ⚡ Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/SyncMeet.git

cd SyncMeet
```

---

## Backend

```bash
cd server

npm install

npm run dev
```

---

## Frontend

```bash
cd client

npm install

npm run dev
```

---

# 🔑 Environment Variables

### Server

Create `.env`

```env
NODE_ENV=development

PORT=4000

CLIENT_URL=http://localhost:5173

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

JWT_SECRET=YOUR_SECRET

STUN_URLS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302

TURN_URLS=

TURN_USERNAME=

TURN_CREDENTIAL=
```

---

### Client

Create `.env`

```env
VITE_SERVER_URL=http://localhost:4000

VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

---

# 🎯 Key Highlights

- Peer-to-peer video communication using **WebRTC**
- Real-time signaling using **Socket.IO**
- Secure authentication using **Google OAuth + JWT**
- Responsive modern UI with Tailwind CSS
- Protected routes
- Meeting participant limit
- Screen sharing with track replacement
- Rate limiting
- Security headers using Helmet
- Input validation using Zod
- Production-ready project architecture

---

# 📈 Future Improvements

- Docker Support
- Redis Adapter
- TURN Auto Provisioning
- Meeting Recording
- Virtual Background
- Waiting Room
- Calendar Integration
- Notifications

---

# 🤝 Contributing

Pull requests are welcome.

For major changes, please open an issue first.

---

# 📜 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Harsh Chaurasia**

GitHub:
https://github.com/84yaHarsh

LinkedIn:
https://www.linkedin.com/in/84yaharsh/
---

⭐ If you found this project helpful, consider giving it a star!
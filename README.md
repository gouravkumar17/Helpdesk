# Helpdesk Mini Project

## Overview
The **Helpdesk Mini Project** is a full-stack web application that allows users to register, log in, and submit support tickets. Support staff or admins can view, manage, and resolve tickets.  

The project is built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js) and demonstrates **user authentication, ticket management, and RESTful APIs**.  

The backend is deployed on **Render**, and the frontend is hosted on **Netlify**, making it fully accessible online.

---

## Features

### User
- **Sign Up & Log In:** Secure authentication using JWT tokens.  
- **Create Tickets:** Users can submit support requests with title and description.  
- **View Tickets:** Users can see all their submitted tickets.  
- **Update/Close Tickets:** Users can update ticket status or mark as resolved.  

### Admin / Support Staff
- **View All Tickets:** Access and monitor all submitted tickets.  
- **Manage Tickets:** Assign, update, or resolve tickets.  
- **User Management:** View users and their tickets.  

### General
- RESTful API design.  
- Protected routes using JWT authentication.  
- Responsive and modern frontend UI.  
- CORS enabled for seamless frontend-backend communication.  
- Environment variables for secure configuration.  

---

## Tech Stack

| Layer           | Technology                  |
|----------------|-----------------------------|
| Frontend       | React.js                     |
| Backend        | Node.js, Express.js           |
| Database       | MongoDB Atlas                |
| Authentication | JWT, bcrypt.js               |
| Deployment     | Render (Backend), Netlify (Frontend) |

---

## Installation & Setup

### 1. Clone the Project
```bash
git clone https://github.com/<your-username>/Helpdesk.git
cd Helpdesk
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a .env file with:
```bash
MONGODB_URI=<Your MongoDB Connection String>
JWT_SECRET=<Your Secret Key>
```
Start the backend:
```bash
npm run dev/npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Start the frontend:
```bash
npm start
```



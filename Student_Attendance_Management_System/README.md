# Student Attendance Management System

A starter full-stack academic project based on the supplied project report:
- Frontend: HTML, CSS and browser JavaScript
- Backend: Node.js and Express REST API
- Database: MongoDB with Mongoose
- Authentication: JWT and bcrypt password hashing
- Roles: admin, faculty and student

## Requirements
- Node.js 18+
- MongoDB local server or MongoDB Atlas database

## Run locally (Windows)
1. Install Node.js.
2. Extract this ZIP.
3. Open the extracted folder in VS Code.
4. Open Terminal in VS Code.
5. Run `npm install`.
6. Copy `.env.example` to `.env`.
7. Edit `.env` and set `MONGO_URI` and a long random `JWT_SECRET`.
8. Run `npm start`.
9. Open http://localhost:3000

## First use
Open the page and expand "Need a demo account?" to register an admin account. Sign in.
- Admin can add courses and student accounts.
- Faculty can load the student list and mark attendance.
- Students can view their own attendance summary.

For an initial demo, create admin, faculty and student accounts through registration. In a real deployment, disable public registration and have an administrator provision accounts. Assign a faculty member to a course using the database or extend the admin UI.

## Deploy to Render
1. Push the complete project to a GitHub repository.
2. Create a Render Web Service and connect the repository.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables `MONGO_URI` and `JWT_SECRET` in Render.
6. Deploy. The app listens on `process.env.PORT`.

## Important
This is an educational starter project, not a production-ready university system. Before real use, add stronger account provisioning, faculty-course assignment UI, audit logs, backups, rate limiting, validation, security review and institution-approved privacy controls. Never commit `.env`, credentials or real student records.

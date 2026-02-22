# Engi Connect — University Communication & Discussion Board

A full-stack web application designed to facilitate communication, activity management, and student engagement within a university engineering faculty. Built as a Software Engineering course project.

> **Live Demo:** [engiconnect.online](https://engiconnect.online)

---

## Features

### Authentication & User Management
- JWT-based authentication with role-based access control (Admin / Student)
- User registration and login with secure password handling

### Real-Time Chat
- WebSocket-powered instant messaging
- Chat room / lobby system for group communication

### Discussion Board (Posts)
- Create, view, and manage discussion posts
- Post status management and moderation by admins

### Portfolio
- Students can build and showcase personal portfolios
- Portfolio review and approval workflow

### Certificate Management
- Upload and manage certificates earned from activities
- Admin verification and approval system

### Activity Registration & Events
- Browse and register for university activities and events
- Registration tracking and attendance management

### Activity Evaluation
- Evaluation forms with customizable scoring topics
- Response collection and result analysis

### Points & Rewards System
- Earn points through activity participation
- Redeem points for rewards managed by admins

### Profile & Skills
- Detailed user profiles with skills, interests, and social links
- Faculty and major metadata support

---

## Tech Stack

| Layer        | Technology                                        |
| ------------ | ------------------------------------------------- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Ant Design, Radix UI |
| **Backend**  | Go (Gin Framework)                                |
| **Database** | PostgreSQL 16                                     |
| **Proxy**    | Nginx (reverse proxy with SSL/TLS)                |
| **Auth**     | JWT (JSON Web Tokens)                             |
| **Real-time**| WebSocket                                         |
| **Infra**    | Docker, Docker Compose                            |
| **SSL**      | Let's Encrypt (Certbot)                           |

---

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌────────────┐
│   Browser    │─────▶│   Nginx (443)    │─────▶│  Frontend  │
│              │      │  Reverse Proxy   │      │  (React)   │
└─────────────┘      │                  │      └────────────┘
                     │  /api/* ────────▶│      ┌────────────┐
                     │                  │─────▶│  Backend   │
                     └──────────────────┘      │  (Go/Gin)  │
                                               └─────┬──────┘
                                                     │
                                               ┌─────▼──────┐
                                               │ PostgreSQL  │
                                               │    16       │
                                               └─────────────┘
```

---

## Project Structure

```
team21/
├── backend/              # Go backend API
│   ├── config/           # Database & environment configuration
│   ├── controller/       # HTTP request handlers
│   ├── dto/              # Data Transfer Objects
│   ├── entity/           # Database models (GORM)
│   ├── middleware/       # CORS & auth middleware
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic & WebSocket hub
│   ├── test/             # Backend test files
│   └── Dockerfile
├── frontend/             # React + TypeScript SPA
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page views (admin, student, auth)
│   │   ├── services/     # API client services (Axios)
│   │   ├── interfaces/   # TypeScript type definitions
│   │   ├── routes/       # React Router configuration
│   │   ├── context/      # React context providers
│   │   └── hooks/        # Custom React hooks
│   └── Dockerfile
├── nginx/                # Nginx configuration
│   └── nginx.conf
├── uat/                  # UAT test scripts (Python)
├── compose.yaml          # Docker Compose (production)
├── .env                  # Environment variables
└── deploy.md             # Deployment guide
```

---

## Quick Start (Development)

### Prerequisites

- [Docker](https://www.docker.com/)
- [Go 1.25+](https://go.dev/doc/install)
- [Node.js 24+](https://nodejs.org/)

### 1. Start the Database

```bash
docker compose up db -d
```

> Database configuration is managed via the `.env` file.

### 2. Run the Backend

```bash
cd backend
go run main.go
```

Backend will be available at `http://localhost:8080`

### 3. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Cleanup

```bash
# Stop and remove containers
docker compose down

# Stop, remove containers, AND delete database volumes
docker compose down -v
```

---

## Testing

### Backend Unit Tests

```bash
cd backend
go test ./test/...
```

### UAT (User Acceptance Testing)

UAT scripts are located in the `uat/` directory (Python-based).

---

## Team

**Team 21** — Software Engineering Course (SUT68)

---

## License

This project was developed for educational purposes as part of a university course.
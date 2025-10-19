# Kanban Board Monorepo

## Architecture (High-Level)

**Frontend:**

- **React** – client UI (Kanban board, calendar, drag&drop)
- **Angular** – admin panel (users, statistics, settings)

**Backend (Node.js + NestJS microservices):**

- **Auth Service** – JWT + refresh, RBAC/ACL
- **User Service** – CRUD, profiles, roles
- **Task Service** – tasks, boards, lists
- **Notification Service** – WebSocket + email
- **Analytics Service** – data aggregation for admin panel

**Infrastructure:**

- API Gateway (NestJS, Fastify, proxies requests to microservices)
- Message broker: RabbitMQ / Kafka (event-driven, e.g., task.created → notification)
- DB: PostgreSQL (relational) + Redis (cache)
- DevOps: Docker Compose (local), Kubernetes (cloud), CI/CD (GitHub Actions)

**Monorepo:** NX (apps/ and libs/)

---

## MVP Functionality (2–3 weeks)

### Sprint 1

- Setup NX monorepo
- Auth service: registration, login, JWT + refresh
- User service: profile, roles (admin, user)
- React frontend: login/register pages
- API Gateway: initial setup to route requests to services

### Sprint 2

- Task service: CRUD tasks (title, description, status, assignedTo)
- Split into boards (Kanban columns)
- WebSocket channel: real-time task updates
- React frontend: Kanban with drag&drop (`react-beautiful-dnd`)
- Angular admin: user list, board list

### Sprint 3

- Notification service: events → WebSocket + email (nodemailer)
- Analytics service: statistics (task count, average completion time)
- Angular admin: dashboard with charts
- React frontend: push notifications (toast on task updates)

### Sprint 4

- Docker Compose for local launch (gateway + services + frontends)
- CI/CD (GitHub Actions: build + test + deploy)
- Deploy on Render/Heroku/Netlify for live demo

---

## Technologies Used

- **Frontend:** React, Angular, TailwindCSS, react-beautiful-dnd
- **Backend:** Node.js, NestJS, JWT, WebSocket, nodemailer
- **DB & Cache:** PostgreSQL, Redis
- **Messaging:** RabbitMQ / Kafka
- **DevOps:** Docker Compose, Kubernetes, GitHub Actions CI/CD
- **Monorepo:** NX
- **API Gateway:** NestJS + Fastify + HTTP Proxy

---

## Local Setup

1. Clone the repository:

```bash
git clone git@github.com:yourusername/kanban-board.git
cd kanban-board
```

2. Install dependencies:

```bash
npm install
```

3. Start Docker Compose:

```bash
docker-compose up -d
```

4. Serve frontend and backend services:

```bash
nx serve client-ui
nx serve admin-ui
nx serve auth-service
nx serve user-service
nx serve task-service
nx serve notification-service
nx serve analytics-service
nx serve api-gateway
```

---

## Demo Value for Interview

- Architectural diagram → show service design
- GitHub repo with README + CI/CD
- Live deploy (demo playground)
- Markdown/slides explaining decisions (microservices, React+Angular, trade-offs)

---

## Project Structure

```
apps/
  auth-service/
  user-service/
  task-service/
  notification-service/
  analytics-service/
  client-ui/
  admin-ui/
  api-gateway/
libs/
  shared/
```

# DevConnect 🚀

> A social platform for developers — built with React, FastAPI, PostgreSQL, Docker, Kubernetes, and CI/CD.

![DevConnect](https://img.shields.io/badge/Stack-React%20%7C%20FastAPI%20%7C%20PostgreSQL-7c6aff?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestrated-326CE5?style=flat-square&logo=kubernetes)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=flat-square&logo=github-actions)

---

## 🌐 Live Demo
> Deploy and add your live URL here

---

## 📸 Screenshots
> Add screenshots of your app here after deployment

---

## 🏗️ Architecture

```
React Frontend (Nginx)
       ↓  REST API calls
FastAPI Backend
       ↓
PostgreSQL Database

All services run in Kubernetes Pods
Monitored by Prometheus + Grafana
Auto-deployed by GitHub Actions CI/CD
```

---

## ✨ Features

- **Authentication** — JWT-based register/login
- **Posts** — Create posts with text and code snippets
- **Feed** — Personalized feed from followed developers
- **Explore** — Discover all posts and search by user/skill
- **Follow System** — Follow/unfollow developers
- **Likes & Comments** — Engage with posts
- **Notifications** — Real-time alerts for likes, comments, follows
- **Direct Messages** — Chat with other developers
- **Profile** — Customizable profiles with skills and GitHub links

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Axios, Tailwind-style CSS Modules |
| Backend | Python, FastAPI, SQLAlchemy, JWT |
| Database | PostgreSQL 16 |
| Containerization | Docker, Docker Compose |
| Orchestration | Kubernetes (Minikube / EKS) |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus, Grafana |
| Image Registry | Docker Hub |

---

## 🚀 Quick Start (Local)

### Prerequisites
- Docker & Docker Compose installed
- Git

### Run with Docker Compose

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/devconnect.git
cd devconnect

# Start all services
docker-compose up --build

# App is live at:
# Frontend → http://localhost:3000
# Backend API → http://localhost:8000
# API Docs → http://localhost:8000/docs
```

---

## ☸️ Kubernetes Deployment

### Prerequisites
- Minikube installed and running
- kubectl configured

```bash
# Start Minikube
minikube start

# Apply all manifests
kubectl apply -f k8s/postgres.yml
kubectl apply -f k8s/backend.yml
kubectl apply -f k8s/frontend.yml
kubectl apply -f k8s/ingress.yml
kubectl apply -f k8s/monitoring.yml

# Check pods are running
kubectl get pods -n devconnect

# Access the app
minikube service frontend-service -n devconnect

# Access Grafana dashboard
minikube service grafana-service -n devconnect
# Login: admin / devconnect123
```

---

## ⚙️ CI/CD Pipeline

Every push to `main` automatically:

1. ✅ Runs backend tests
2. ✅ Builds Docker images for frontend + backend
3. ✅ Pushes images to Docker Hub with commit SHA tag
4. ✅ Deploys updated images to Kubernetes
5. ✅ Verifies rollout success

### GitHub Secrets Required

| Secret | Description |
|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `KUBECONFIG` | Base64-encoded kubeconfig file |

---

## 📊 Monitoring

- **Prometheus** — scrapes metrics from backend and Kubernetes pods
- **Grafana** — visualizes CPU, memory, request rates, pod health
- Access Grafana at `http://localhost:30300` after K8s deployment

---

## 📁 Project Structure

```
devconnect/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── core/                # DB + Security
│   ├── models/              # SQLAlchemy models
│   ├── routes/              # API endpoints
│   ├── schemas/             # Pydantic schemas
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── context/         # Auth context
│   │   └── utils/           # API helpers
│   ├── public/
│   ├── Dockerfile
│   └── nginx.conf
├── k8s/
│   ├── postgres.yml         # Database deployment
│   ├── backend.yml          # Backend + HPA
│   ├── frontend.yml         # Frontend + HPA
│   ├── ingress.yml          # Traffic routing
│   └── monitoring.yml       # Prometheus + Grafana
├── .github/
│   └── workflows/
│       └── deploy.yml       # CI/CD pipeline
└── docker-compose.yml       # Local development
```

---

## 🔧 Environment Variables

### Backend
| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string |
| `SECRET_KEY` | `change-in-production` | JWT signing key |

### Frontend
| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:8000` | Backend API URL |

---

## 👤 Author

Built by [Your Name](https://github.com/YOUR_USERNAME) as a DevOps portfolio project.

---

## 📄 License
MIT

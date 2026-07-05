# People's Priorities

People's Priorities is a data-driven legislative decision-making platform that maps citizen development requests to actionable, AI-powered project recommendations.

---

## Project Architecture

- **Frontend**: Next.js 16 (App Router, Tailwind CSS, Leaflet Maps, dynamic client rendering).
- **Backend**: FastAPI (Python 3.11+, SQLAlchemy 2.0, PostgreSQL, Pydantic, Alembic).
- **Database**: PostgreSQL 16 & pgAdmin 4 running inside Docker containers.

---

## Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Must be running)
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.11+)

---

## 1. Database Setup (Docker)

To start the database and pgAdmin management console:

1. Spin up the containers from the project root:
   ```bash
   docker compose up -d
   ```
2. Services will start on the following ports:
   - **PostgreSQL**: `localhost:5432` (Credentials: `postgres` / `postgres`)
   - **pgAdmin**: [http://localhost:8080](http://localhost:8080) (Credentials: `admin@admin.com` / `admin`)

---

## 2. Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment variables:
   ```bash
   copy .env.example .env
   ```
5. Apply database migrations:
   ```bash
   alembic upgrade head
   ```
6. Seed database with realistic constituency data (12 Wards, 1,200 Citizen Submissions, 80 AI Recommendations, AI Clusters):
   ```bash
   python seed_data.py
   ```
7. Run the backend development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 3. Frontend Setup (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the frontend development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## Database Schemas & Models (SQLAlchemy 2.0)

- **`Ward`**: Represents administrative municipal sectors with demographic data and infrastructure metrics.
- **`CitizenSubmission`**: Tracks complaints/demands, reporting categories, timestamps, status and citizen sentiments.
- **`AIAnalysis`**: Linked one-to-one with submissions containing AI-summarized insights, keyword extraction, and priority scores.
- **`Recommendation`**: Lists AI-suggested developments (schools, hospitals, transit options) complete with budgets, impact estimations, and reasoning.
- **`AICluster`**: Groups similar complaints together into prioritized sectors to identify systemic demands.
- **`PublicDataset`**: Holds raw census/demographic metrics.

---

## Troubleshooting

### Port 5432 is already allocated
If Docker fails with a port allocation conflict, another PostgreSQL instance is likely running locally.
- **Windows**: Stop the local service from Services (`Services.msc` -> PostgreSQL -> Stop) or find the PID and run `taskkill /F /PID <process_id>` finding it via `netstat -ano | findstr 5432`.
- **Docker**: Run `docker ps` to find and stop conflicting containers via `docker stop <container_name>`.

### Next.js Build Fails on Leaflet
Next.js Server Components compile on the server side and do not have access to the browser global `window`. Ensure any Leaflet maps are loaded dynamically inside Client Components:
```typescript
import dynamic from 'next/dynamic';
const HotspotMap = dynamic(() => import('@/components/dashboard/HotspotMap'), { ssr: false });
```
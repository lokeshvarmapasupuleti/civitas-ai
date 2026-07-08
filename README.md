# Civitas AI
### AI-Powered Citizen Feedback & Development Intelligence Platform

<p align="center">

![Python](https://img.shields.io/badge/Python-3.11+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![NextJS](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![License](https://img.shields.io/badge/License-MIT-green)

</p>

---

# Overview

Civitas AI is an AI-powered governance platform designed to transform how citizen development requests are collected, analyzed, prioritized, and visualized.

Instead of relying on manual review of thousands of complaints, suggestions, letters, and social media requests, Civitas AI automatically consolidates citizen feedback, detects recurring issues, identifies demand hotspots, and recommends the most impactful development works.

The platform provides decision-makers with actionable intelligence while giving citizens a simple multilingual interface to submit their concerns.

---

# Problem Statement

Development requests reach public representatives through multiple disconnected channels:

- Public meetings
- Grievance portals
- Social media
- Email
- Letters
- Voice messages
- Images
- Direct representations

This creates several challenges:

- Duplicate complaints
- Manual prioritization
- Subjective decision making
- Poor visibility of recurring issues
- Lack of demand analysis
- Difficulty comparing competing development projects

Civitas AI solves these problems using Artificial Intelligence.

---

# Solution

The platform enables citizens to submit development requests using:

- Text
- Voice
- Images
- Multilingual inputs

The AI engine automatically:

- Detects language
- Transcribes speech
- Extracts text from images
- Translates content
- Categorizes complaints
- Performs sentiment analysis
- Generates summaries
- Clusters similar requests
- Calculates priority scores
- Detects demand hotspots
- Produces actionable recommendations

The final result is a centralized intelligence dashboard that helps authorities understand what citizens actually need.

---

# Key Features

## Citizen Portal

- Submit complaints
- Submit suggestions
- Upload images
- Upload voice recordings
- Multilingual support
- Track submissions

---

## AI Processing Pipeline

Every submission passes through an intelligent processing pipeline:

```
Submission
      │
      ▼
Language Detection
      │
      ▼
Speech-to-Text (if audio)
      │
      ▼
OCR (if image)
      │
      ▼
Translation
      │
      ▼
Categorization
      │
      ▼
Sentiment Analysis
      │
      ▼
Summarization
      │
      ▼
Similarity Detection
      │
      ▼
Clustering
      │
      ▼
Priority Engine
      │
      ▼
Recommendations
```

---

## Dashboard

Interactive governance dashboard featuring:

- KPI Cards
- Analytics
- AI Recommendations
- Demand Hotspots
- Ward Statistics
- Monthly Trends
- Priority Distribution
- Review Queue
- Infrastructure Insights

---

## AI Assistant

Natural language assistant capable of answering governance-related questions such as:

- What are the highest priority issues?
- Which ward has the most complaints?
- Show recent water supply issues.
- Which development work should be prioritized?

---

## Monitoring

Built-in monitoring includes:

- Health endpoint
- Metrics endpoint
- System status
- API latency
- Database latency
- Cache monitoring
- Error rate tracking

---

## Authentication

Secure authentication system featuring:

- JWT Authentication
- Refresh Tokens
- Password Reset
- RBAC
- Session Management

---

# AI Capabilities

- Language Detection
- Translation
- OCR
- Speech-to-Text
- Sentiment Analysis
- Complaint Categorization
- AI Summarization
- Semantic Similarity Detection
- Complaint Clustering
- AI Priority Ranking
- Recommendation Engine

---

# Architecture

```
                     Citizens
                         │
      ┌──────────────────┴──────────────────┐
      │                                     │
  Text / Voice / Image                Web Portal
      │                                     │
      └───────────────┬─────────────────────┘
                      │
               FastAPI Backend
                      │
       ┌──────────────┼──────────────┐
       │              │              │
 Authentication    AI Engine     Database
       │              │              │
       │      NLP Processing         │
       │      OCR                    │
       │      Speech Recognition     │
       │      Clustering             │
       │      Priority Engine        │
       │              │              │
       └──────────────┼──────────────┘
                      │
              Analytics Dashboard
```

---

# Tech Stack

## Frontend

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- Recharts
- Leaflet Maps

---

## Backend

- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- JWT Authentication

---

## Database

- PostgreSQL
- SQLite (Development)

---

## AI / NLP

- Transformers
- OCR
- Speech-to-Text
- Language Detection
- Translation
- Clustering
- Similarity Matching

---

## DevOps

- Docker
- Docker Compose
- GitHub Actions
- Railway
- Vercel

---

# Folder Structure

```
Civitas-AI/

backend/
│
├── app/
│   ├── api/
│   ├── services/
│   ├── ai_pipeline/
│   ├── models/
│   ├── schemas/
│   ├── database/
│   └── main.py
│
├── alembic/
├── tests/
└── requirements.txt

frontend/
│
├── app/
├── components/
├── lib/
└── public/

docs/
datasets/
assets/
```

---

# API Endpoints

## Authentication

```
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/reset-password/request
POST /auth/reset-password/confirm
```

---

## Citizen Requests

```
GET /submissions

POST /submissions
```

---

## AI

```
POST /ai/process/{submission_id}

POST /assistant/query
```

---

## Analytics

```
GET /analytics

GET /recommendations
```

---

## Monitoring

```
GET /health

GET /metrics

GET /system/status
```

---

# Security Features

- JWT Authentication
- Role-Based Access Control
- Refresh Tokens
- Rate Limiting
- Secure HTTP Headers
- Input Validation
- Password Hashing
- Session Revocation

---

# Testing

The backend includes automated tests covering:

- Authentication
- Authorization
- AI Pipeline
- Monitoring
- Recommendations
- Analytics
- Background Jobs
- Submission APIs

```
66 Tests Passed
```

---

# Future Scope

- WhatsApp Integration
- Telegram Bot
- Mobile Application
- GIS Heatmaps
- Real-time Notifications
- AI Budget Estimation
- Predictive Infrastructure Planning
- Smart City Integration
- Government API Integration
- LLM-powered Policy Insights

---

# Deployment

Frontend

```
Vercel
```

Backend

```
Railway
```

Database

```
Supabase PostgreSQL
```

---

# Contributors

**Lokesh Varma Pasupuleti and K  Praveen Kumar**

B.Tech Artificial Intelligence & Machine Learning

Marwadi University

---

# License

MIT License

---

# Acknowledgements

Built for the **People's Priorities Track** to demonstrate how Artificial Intelligence can improve citizen engagement, evidence-based development planning, and data-driven governance.

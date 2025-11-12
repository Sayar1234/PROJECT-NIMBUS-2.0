Project Nimbus 2.0

A Browser-Based AI Operating System / Simulation

Overview

Project Nimbus 2.0 is a cloud-ready, browser-based AI OS simulation that provides a unified environment for file management, note-taking, AI chat, and terminal commands. The system integrates a local file manager, AI-powered terminal, and collaborative tools, providing a seamless experience for modern AI workflows.

Features

File Manager

Upload, create, edit, and delete files and folders

Browse directory structure with metadata (size, type, creation/modification dates)

Supports text content reading and editing

Notes App

Create, edit, and delete notes

Tagging and pinning functionality for better organization

Optional AI enhancements (summarize, expand, outline)

AI-Powered Terminal

Execute commands in a simulated OS-like environment

AI interpreter can understand CRUD intents for files and notes

Provides structured JSON responses for terminal commands

AI Chat / LLM Integration

Powered by Groq LLM API (configurable in .env)

Supports contextual chat and AI task execution

System Metrics Endpoint

Monitor CPU usage, memory consumption, database query stats, and AI call stats

Tech Stack
Backend

Python 3.12 — FastAPI server

FastAPI — REST API and static file server

SQLAlchemy + SQLite — Local database for persistence

Groq Python Client — AI/LLM integration

Pydantic — Data validation and settings

Uvicorn — ASGI server for deployment

Frontend

React + Vite — Single-page application

TypeScript — Strongly-typed JavaScript

TailwindCSS — Styling and utility-first design

Zustand — State management

React-RND — Resizable/draggable windows UI

React-Icons — UI icons

Dev Tools

Git for version control

Python virtual environment management

Node.js / npm for frontend dependencies

Project Structure
/Numbus@.0
├─ /app
│  ├─ main.py                  # FastAPI entrypoint
│  ├─ config.py                # Settings / .env integration
│  ├─ ai_service.py            # LLM & terminal logic
│  ├─ database.py              # SQLAlchemy setup
│  └─ /api                     # API routers (files, notes, chat, terminal, settings)
│     ├─ files.py
│     ├─ notes.py
│     ├─ chat.py
│     ├─ terminal.py
│     └─ settings.py
├─ /app/models                  # ORM models
├─ /app/schemas                 # Pydantic schemas
├─ /storage/files               # Uploaded or created files
├─ requirements.txt             # Backend dependencies
├─ package.json                 # Frontend dependencies
└─ /src                         # Frontend source code (React + Vite)

Setup & Installation
Backend

Clone the repository:

git clone https://github.com/shrey00008/PROJECT-NIMBUS-2.0.git
cd PROJECT-NIMBUS-2.0


Create a virtual environment:

python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows


Install dependencies:

pip install --upgrade pip
pip install -r requirements.txt


Create .env file (copy from .env.example) and set:

GROQ_API_KEY=your_api_key_here


Run backend:

uvicorn app.main:app --reload

Frontend

Navigate to frontend folder:

cd frontend


Install dependencies:

npm install


Run frontend dev server:

npm run dev

API Endpoints

/api/files — File CRUD operations

/api/notes — Notes CRUD operations

/api/chat — AI chat interface

/api/terminal — AI-powered terminal commands

/api/settings — App and environment settings

/api/metrics — System and database metrics

Deployment

Backend and frontend can be deployed on Render or similar cloud platforms.

Recommended Python version: 3.12

Ensure .env variables are configured in the deployment environment.

Use a static build for the frontend and point API calls to the backend URL.

Future Enhancements

Full AI OS simulation with multi-user support

Cloud file storage (S3 or GCS) instead of local filesystem

Persistent user sessions and authentication

Enhanced AI capabilities for code, text, and file manipulation

Real-time collaboration features
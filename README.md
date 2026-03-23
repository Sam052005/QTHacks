# QTHacks: Sequential Logic Simulator 🚀

Welcome to the **Virtual Sequential Logic Simulator**, a full-stack, AI-enhanced platform for designing, simulating, and debugging complex digital circuits with fixed-cycle flip-flops and counters.

## 🌟 Overview
This platform allows students and engineers to visually build and simulate sequential logic circuits (D, JK, T Flip-Flops, Shift Registers, and Counters) while an AI assistant (Groq) monitors their logic in real-time, providing debugging insights and structural analysis.

## 🛠️ Tech Stack
- **Frontend**: 
  - **Framework**: Next.js (App Router)
  - **3D Engine**: React Three Fiber (@react-three/fiber, @react-three/drei)
  - **State Management**: Zustand
  - **Styling**: TailwindCSS & Lucide Icons
- **Backend**:
  - **Runtime**: Node.js (Express)
  - **ORM**: Prisma
  - **Database**: SQLite (Zero-Setup Architecture)
  - **AI**: Groq SDK for real-time logic debugging

## 🚀 Key Features
### 1. **3D Visual Simulation**
A highly interactive 3D canvas that visualizes:
- **Flip-Flop States**: Dynamic color shifts (Blue for Logic 0, Neon-Green for Logic 1).
- **Signal Pulses**: Animated wire path animations showing the flow of binary data.
- **Clock Pulses**: An emissive, oscillating clock module synced to simulation cycles.

### 2. **Professional Timing Diagrams**
- Real-time SVG-based waveform generation for Input, Clock, and all Flip-Flop outputs.
- Synchronized playhead that tracks exactly where the simulation current cycle is.

### 3. **AI Logic Assistant**
- **LLM Debugging**: Uses the Groq API to analyze your circuit's timing distribution and unique state counts.
- **History Tracking**: Saves every chat conversation within a project for later review.

### 4. **Project Dashboard**
- **User Authentication**: Secure JWT-based sign-up and login.
- **Save & Resume**: Create unlimited workspaces. All your custom circuit parameters, inputs, and simulation history are persisted.

## 🏗️ Architecture
The project follows a "Simulation-as-a-Service" model:
1. **Frontend** captures the user's circuit type and bit sequence.
2. **Backend Engine** (`Backend/src/engine/circuits.ts`) executes a cycle-accurate, deterministic logic simulation.
3. **Database Layer** (Prisma/SQLite) stores the discrete state of every flip-flop for every cycle.
4. **Zustand Store** pulls this data in bulk for smooth, zero-latency frontend playback.

## 📂 Project Structure
```bash
├── Frontend/           # Next.js Application
│   ├── app/            # Routes (Simulator, Login, Signup, Profile)
│   ├── components/     # UI, 3D Canvas, Control Panels, Timing Diagram
│   └── lib/            # Zustand Stores (Simulation & Auth)
├── Backend/            # Express.js Server
│   ├── src/
│   │   ├── engine/     # The Logic Simulation Core (Pure TypeScript)
│   │   ├── routes/     # API Endpoints (Auth, Project, Simulation, Chat)
│   │   ├── services/   # Business Logic & DB Transactions
│   │   └── index.ts    # Server Entrypoint
│   └── prisma/         # Database Schema and SQLite file (dev.db)
```

## ⚙️ How to Run
### 1. Backend
```bash
cd Backend
npm install
npx prisma db push
npm run dev
```
*Note: Make sure to configure your `.env` with `JWT_SECRET` and `GROQ_API_KEY`.*

### 2. Frontend
```bash
cd Frontend
npm install
npm run dev
```
Visit: `http://localhost:3000`

## 🛡️ Database & Security
We utilize a **Zero-Setup Architecture** using Prisma and SQLite. All data (Users, Projects, and AI history) is stored in a single, stable file: `Backend/prisma/dev.db`. There is no need for external MongoDB or PostgreSQL services to run the project in development mode.

---
Built with ❤️ for digital logic enthusiasts.

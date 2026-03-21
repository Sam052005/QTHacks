# Virtual Sequential Logic Simulator Backend - Architecture

## Overall System Design
The backend is a Node.js API built using Express and TypeScript. It uses Prisma ORM to interact with a SQLite database (capable of being swapped to PostgreSQL without codebase changes). 

### Core Components
1. **Simulation Engine (`src/engine`)**
   - Pure logic engine representing the physical hardware abstractly.
   - `FlipFlop` base class with implementations for D, JK, T flip-flops.
   - `SequentialCircuit` abstracting common arrays of flip-flops like Shift Register, Ring Counter, and Johnson Counter.

2. **API Routes (`src/routes`)**
   - RESTful endpoints governing simulations, pre-configured circuits, learning challenges, and data exports.

3. **Service Layer (`src/services`)**
   - Acts as the bridge between the stateless API requests, the pure engine logic, and the persistent Prisma database.
   - Evaluates engine states across continuous cycles, converting intermediate outputs into discrete database records (`SimulationService`).
   - Translates database query results into exportable formats like JSON and CSV (`ExportService`).

### Database Schema (Prisma)
- **Simulation**: Represents a simulation session with basic simulation parameters.
- **FlipFlopState**: Represents the current states (Q and Q') of each flip-flop within a simulation.
- **TimingPoint**: Logs the historical inputs and outputs for each cycle of a simulation to generate waveform and analytics data.
- **Challenge**: Learning exercises involving digital logic.
- **CircuitPreset**: Stored, pre-configured circuits ready to be instantiated by frontend users.

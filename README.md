# 🚇 MoveMetro - Smart Metro Booking Service
https://move-metro.vercel.app/dashboard

A production-grade, scalable Metro Booking Service that models metro networks as graphs, computes optimal routes with interchange handling, and generates secure QR-compatible booking tickets.

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     REACT FRONTEND                         │
│  Login │ Dashboard │ Book Ride │ My Bookings │ Admin Panel  │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (JWT Auth)
┌────────────────────────▼────────────────────────────────────┐
│                   EXPRESS BACKEND                           │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────────────┐   │
│  │Controller │→│  Service     │→│ Path Optimization     │   │
│  │  Layer    │  │  Layer       │  │    Engine             │   │
│  └──────────┘  └──────┬──────┘  │ ┌──────────────────┐  │   │
│                       │          │ │ Dijkstra Strategy │  │   │
│  ┌──────────┐  ┌──────▼──────┐  │ │ (Extensible: A*) │  │   │
│  │Middleware │  │ Repository  │  │ └──────────────────┘  │   │
│  │Auth/Valid │  │ (Sequelize) │  │ ┌──────────────────┐  │   │
│  └──────────┘  └──────┬──────┘  │ │  Graph Manager   │  │   │
│                       │          │ │   (Singleton)    │  │   │
│  ┌──────────┐  ┌──────▼──────┐  │ └──────────────────┘  │   │
│  │  Cache   │  │ PostgreSQL  │  └──────────────────────┘   │
│  │  (Redis) │  │             │                              │
│  └──────────┘  └─────────────┘                              │
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ ER Diagram

```
┌──────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐
│  USERS   │     │  STOPS   │     │   ROUTES   │     │ BOOKINGS │
├──────────┤     ├──────────┤     ├────────────┤     ├──────────┤
│ id (PK)  │     │ id (PK)  │     │ id (PK)    │     │ id (PK)  │
│ name     │     │ name     │     │ name       │     │ user_id  │─── FK → USERS
│ email    │     │ code (UQ)│     │ color      │     │ src_id   │─── FK → STOPS
│ passHash │     │ createdAt│     │ createdAt  │     │ dst_id   │─── FK → STOPS
│ role     │     │ updatedAt│     │ updatedAt  │     │ time     │
│ createdAt│     └────┬─────┘     └─────┬──────┘     │ stops    │
│ updatedAt│          │                 │             │ transfers│
└──────────┘          │    ┌────────────┤             │ snapshot │
                      │    │ ROUTE_STOPS│             │ qrString │
                      │    ├────────────┤             │ status   │
                      └────│ stop_id(FK)│             │ idempKey │
                           │ route_idFK)│─────────────│ createdAt│
                           │ stopOrder  │             └──────────┘
                           │ travelTime │
                           └────────────┘
```

## 🛠 Tech Stack

| Layer          | Technology               |
| -------------- | ------------------------ |
| **Backend**    | Node.js + Express        |
| **Database**   | PostgreSQL + Sequelize   |
| **Cache**      | Redis                    |
| **Auth**       | JWT (Access + Refresh)   |
| **Containers** | Docker + Docker Compose  |
| **CI/CD**      | GitHub Actions           |
| **Monitoring** | Prometheus metrics       |
| **Docs**       | Swagger / OpenAPI        |
| **Testing**    | Jest + Supertest + SQLite|

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### Option 1: Docker Compose (Recommended)
```bash
git clone <repo>
cd MoveMetro
docker-compose up -d
```
The system will be available at `http://localhost:5000`.

### Option 2: Manual Setup
```bash
# Backend
cd backend
npm install
# Edit .env with your PostgreSQL/Redis credentials
npm run seed       # Sync DB schema and load sample Delhi Metro data
npm run dev        # Starts on :5000
```

### Default Accounts
| Role  | Email                 | Password |
| ----- | --------------------- | -------- |
| Admin | admin@movemetro.com   | admin123 |
| User  | user@movemetro.com    | user123  |

## 🧠 Complexity Analysis

### Dijkstra's Algorithm
- **Time**: O((V + E) log V) where V = stops, E = connections
- **Space**: O(V + E) for adjacency list + priority queue

### Optimization Modes
| Mode              | Cost Function                              |
| ----------------- | ------------------------------------------ |
| **OPTIMAL**       | `TravelTime + TransferPenalty × Transfers` |
| **SHORTEST_TIME** | `TravelTime`                               |
| **MINIMUM_STOPS** | `StopCount`                                |
| **MIN_TRANSFERS** | `Transfers × 1000 + TravelTime`            |

## ⚖️ Trade-offs

| Decision               | Trade-off                                               |
| ---------------------- | ------------------------------------------------------- |
| **In-memory graph**    | Faster path computation vs. higher memory usage         |
| **Relational Schema**  | Strict data integrity vs. slightly complex join queries |
| **UUID Primary Keys**  | Better security/merge-ability vs. larger index size     |
| **Idempotency Header** | Prevents duplicate bookings vs. client implementation overhead |

## 🧪 Testing

```bash
cd backend
npm test                # All tests with coverage
npm run test:unit       # Unit tests only (SQLite in-memory)
npm run test:integration # Integration tests (SQLite in-memory)
```

## 📋 Sample Data
The seed script loads a simplified **Delhi Metro** network:
- 🔵 **Blue Line**: Dwarka → Rajiv Chowk → Noida (13 stops)
- 🟡 **Yellow Line**: Samaypur Badli → Rajiv Chowk → HUDA CC (11 stops)
- 🔴 **Red Line**: Shaheed Sthal → Kashmere Gate → Rithala (8 stops)
- **Interchanges**: Rajiv Chowk (Blue ↔ Yellow), Kashmere Gate (Yellow ↔ Red)

## 📜 License
MIT

# 🚇 MoveMetro: Project Overview & Technical Documentation

## 🌟 Introduction
**MoveMetro** is a production-grade, scalable metro booking and route optimization service. It allows users to model complex metro networks as graphs, compute optimal paths between stations using various optimization strategies, and generate secure QR-compatible tickets.

---

## 🛠 Tech Stack

### Backend
- **Node.js & Express**: Core runtime and web framework for building the RESTful API.
- **PostgreSQL**: Primary relational database for persistent storage (Users, Routes, Stops, Bookings).
- **Sequelize ORM**: Object-Relational Mapper for handling database operations with strong typing and migrations.
- **Redis (ioredis)**: Used for caching frequently accessed graph data and session management.
- **JWT (jsonwebtoken)**: Secure authentication using Access and Refresh tokens.
- **Winston & Morgan**: Structured logging and HTTP request profiling.
- **Express Validator**: Middleware for robust input sanitization and validation.
- **Swagger (swagger-ui-express)**: Automated API documentation.

### Frontend
- **React.js**: Functional components with Hooks for a dynamic User Interface.
- **Tailwind CSS**: Utility-first CSS framework for modern, responsive designs.
- **Axios**: Promised-based HTTP client for API communication.
- **React Router**: Client-side routing for seamless navigation.
- **React Hot Toast**: Real-time notifications and feedback.
- **Context API**: Global state management for Authentication.

---

## 🧠 Core Algorithms & Logic

### 1. Dijkstra's Shortest Path Algorithm
The heart of MoveMetro is its custom implementation of **Dijkstra's Algorithm**.
- **Data Structure**: Uses an Adjacency List to represent the metro network (stops as nodes, connections as edges).
- **Priority Queue**: Implementation of a **Min-Heap** to ensure efficient $O(\log V)$ node extraction.
- **Complexity**: $O((V + E) \log V)$, providing sub-second computation even for large networks.

### 2. Multi-Objective Optimization
Unlike basic pathfinding, MoveMetro supports multiple "Modes" by dynamically adjusting the cost function:
- **OPTIMAL**: A balanced mix of `TravelTime + (TransferPenalty × Transfers)`.
- **SHORTEST_TIME**: Purely minimizes total travel duration (minutes).
- **MINIMUM_STOPS**: Minimizes the number of stations visited.
- **MIN_TRANSFERS**: Prioritizes staying on the same line to avoid interchanges.

### 3. Interchange Handling
The graph manager detects when a path moves between different `route_id`s. This logic is crucial for real-world metro systems where changing lines involves walking and waiting (modeled as a **Transfer Penalty**).

### 4. Dynamic Pricing Engine
MoveMetro features an automated fare calculation system based on journey complexity:
- **Base Fare**: Fixed entry cost (₹20).
- **Distance Factor**: Incremental cost per station visited (₹5/stop).
- **Convenience Fee**: Surcharge for interchanges to reflect transfer complexity (₹10/transfer).

---

## 🚀 Important Functionalities

- **Graph Manager (Singleton)**: An in-memory singleton that builds and maintains the metro network graph from the database for lightning-fast lookups.
- **Metro Wallet**: A built-in financial system allowing users to maintain a balance, top-up via a mock payment gateway, and pay for tickets seamlessly.
- **Transaction Ledger**: Atomic logging of every credit and debit, ensuring financial integrity and providing users with a clear audit trail.
- **Idempotency Mechanism**: Uses unique headers (`x-idempotency-key`) to prevent duplicate bookings during network retries.
- **Secure Visual QR Ticketing**: Generates scannable, HMAC-signed QR codes. These tokens are cryptographically secured and rendered visually for turnstile compatibility.
- **Profile & Security**: Comprehensive user management including profile updates, identity tracking, and secure password hashing with salt-rounds.
- **Admin Dashboard**: Real-time management of metro lines, stops, and system health monitoring.
- **Responsive Map Visualization**: Interactive UI components that show the computed route segments and interchange points.

---

## 💡 Important Points for Project Explanation

When explaining this project (e.g., in an interview or technical review), focus on these points:

1. **Separation of Concerns**: Explain how the project follows a layered architecture: 
   - `Controllers` for request handling.
   - `Services` for business logic.
   - `Repositories/Models` for data access.
   - `Engine` for complex algorithms.

2. **Graph Modeling**: Mention that metro lines are modeled as **directed edges** with metadata (line color, time, etc.), allowing the system to handle one-way routes if needed.

3. **Production Readiness**: Highlight the use of **Docker**, **JWT Refresh Tokens**, **Rate Limiting (Helmet/Express-Rate-Limit)**, and **Graceful Shutdown** procedures.

4. **Strategy Pattern**: Point out that the pathfinding engine is designed with a `PathStrategy` interface, making it easy to swap Dijkstra for **A*** or other algorithms without changing the rest of the application. Also used for the **QR Generation** strategies (HMAC vs JWT).

5. **Visual Experience**: Note the use of **Glassmorphism** and **Micro-animations** in the CSS to provide a premium "Modern App" feel.

---

## 📦 Database Design (ER Highlights)
- **Users**: RBAC (User/Admin roles) and identity metadata.
- **Wallets**: Linked to Users, storing real-time balances with decimal precision.
- **Transactions**: Immutable history of ledger entries (CREDIT/DEBIT).
- **Stops**: Unique station codes (e.g., RJVCHK for Rajiv Chowk).
- **Routes**: Lines with properties like color and name.
- **RouteStops**: Junction table defining the sequence and travel time between stations.
- **Bookings**: Snapshots of the journey and fare at the time of purchase to ensure historical accuracy.


# 💸 Expense Management System

A full-stack, **event-driven microservices** application for personal finance management — featuring AI-powered transaction categorization, real-time Kafka budget alerts, and an intelligent spending analytics dashboard.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        React Frontend (Vite)                        │
│                           expense-ui                                │
└────┬──────────┬───────────┬──────────────┬──────────────────────────┘
     │          │           │              │
     ▼          ▼           ▼              ▼
 UserMS     TransactionMS  BudgetMS    AnalysisMS   NotificationMS
 :8081        :8082         :8083        :8086          :8084
               │                                         ▲
               │  [Kafka: transaction-events]             │
               └──────────────────► BudgetMS ─────────────┘
                                        │  [Kafka: budget-alerts]
                                        └──────────────────────►

                        GoogleAI MS  :8080  (Gemini API proxy)
                        Kafka UI     :8085  (Admin dashboard)
```

---

## 🧩 Microservices

| Service | Port | Responsibility |
|---|---|---|
| **userMs** | 8081 | User registration & JWT authentication |
| **transactionMS** | 8082 | Payment processing, transaction history, Kafka producer |
| **budgetMS** | 8083 | Budget management, Kafka consumer + producer |
| **notificationMS** | 8084 | Budget breach alerts via Kafka consumer |
| **googleai** | 8080 | Gemini AI proxy for transaction categorization |
| **analysisMS** | 8086 | Spending analytics & AI-generated financial insights |
| **expense-ui** | 5173 | React + Vite frontend dashboard |

---

## ⚡ Kafka Event Flow

This project uses **Apache Kafka** for fully decoupled, asynchronous communication between services.

```
User makes a payment
       │
       ▼
TransactionMS ──── publishes ──► [topic: transaction-events]
                                          │
                                          ▼
                                      BudgetMS (consumer)
                                      • Updates currentSpend in DB
                                      • If spend ≥ 90% of limit:
                                          │
                                          └── publishes ──► [topic: budget-alerts]
                                                                    │
                                                                    ▼
                                                            NotificationMS (consumer)
                                                            • Stores alert in memory
                                                            • Frontend polls /api/notifications
```

### Kafka Topics

| Topic | Producer | Consumer | Payload |
|---|---|---|---|
| `transaction-events` | TransactionMS | BudgetMS | `transactionId`, `amount`, `category`, `monthYear` |
| `budget-alerts` | BudgetMS | NotificationMS | `category`, `monthYear`, `limitAmount`, `currentSpend` |

---

## 🤖 AI Features

- **Auto-categorization**: When a transaction has no category, TransactionMS calls the GoogleAI service (Gemini) to classify it (Food, Travel, Shopping, etc.)
- **Spending Insights**: AnalysisMS builds a monthly spend summary and sends it to Gemini to generate personalized financial advice

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | Spring Boot 3.x |
| Messaging | Apache Kafka, Spring Kafka |
| Database | MySQL (Spring Data JPA, Hibernate) |
| AI Integration | Google Gemini API |
| Security | Spring Security, JWT |
| Frontend | React, Vite |
| Infrastructure | Docker, Docker Compose |
| Build Tool | Maven |

---

## 📋 Prerequisites

- **Java 17+**
- **Node.js 18+** and npm
- **Docker & Docker Compose**
- **MySQL** running locally (or update connection strings)
- **Google Gemini API Key** (for AI features)

---

## 🚀 Getting Started

### 1. Start Kafka Infrastructure (Docker)

```bash
docker-compose up -d
```

This starts:
- **Zookeeper** on port `2181`
- **Kafka Broker** on port `9092`
- **Kafka UI** on port `8085` → open `http://localhost:8085`

### 2. Configure Environment

Add your Gemini API key to `googleai/.env`:
```
GEMINI_API_KEY=your_api_key_here
```

MySQL is expected at `localhost:3306` with database `expense_db`.
Default credentials: `root / root` (update in each service's `application.properties`).

### 3. Start Backend Services

Run each service from its own directory:

```bash
# UserMS
cd userMs && ./mvnw spring-boot:run

# TransactionMS
cd transactionMS && ./mvnw spring-boot:run

# BudgetMS
cd budgetMS && ./mvnw spring-boot:run

# NotificationMS
cd notificationMS && ./mvnw spring-boot:run

# GoogleAI MS
cd googleai && ./mvnw spring-boot:run

# AnalysisMS
cd analysisMS && ./mvnw spring-boot:run
```

### 4. Start Frontend

```bash
cd expense-ui
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## 📡 API Reference

### UserMS — `localhost:8081`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |

### TransactionMS — `localhost:8082`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/transactions/payment` | Process a new payment |
| GET | `/api/transactions/history` | Get transaction history (filters: `weekly`, `monthly`, `amount`, `category`, `status`) |
| GET | `/api/transactions/{id}` | Get transaction by ID |

### BudgetMS — `localhost:8083`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/budgets` | Set a budget for a category/month |
| GET | `/api/budgets` | Get budgets (filters: `monthYear`, `category`) |

### NotificationMS — `localhost:8084`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get recent budget breach alerts (newest first, max 50) |

### AnalysisMS — `localhost:8086`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analysis/monthly-spend?month=2024-05` | Total spend for a month |
| GET | `/api/analysis/top-category?month=2024-05` | Top spending category |
| GET | `/api/analysis/breakdown?month=2024-05` | Spend breakdown by category |
| GET | `/api/analysis/trend?months=6` | Monthly spend trend (last N months) |
| GET | `/api/analysis/compare?month=2024-05` | Compare current vs previous month |
| GET | `/api/analysis/insight?month=2024-05` | AI-generated spending insight |

---

## 🗄️ Database

All services share a single MySQL database: **`expense_db`**

Hibernate is set to `ddl-auto=update` — tables are created/updated automatically on service startup.

---

## 📊 Kafka UI Dashboard

Once Docker is running, open **`http://localhost:8085`** to:
- Browse topics (`transaction-events`, `budget-alerts`)
- Inspect individual messages
- Monitor consumer group lag
- View broker health

---

## 📁 Project Structure

```
Expense Management project2/
├── docker-compose.yml          # Kafka + Zookeeper + Kafka UI
├── userMs/                     # Auth & user management
├── transactionMS/              # Payment processing + Kafka producer
│   └── event/TransactionEvent.java
├── budgetMS/                   # Budget tracking + Kafka consumer/producer
│   ├── listener/TransactionEventListener.java
│   └── event/BudgetAlertEvent.java
├── notificationMS/             # Alert delivery + Kafka consumer
│   ├── listener/BudgetAlertListener.java
│   └── controller/NotificationController.java
├── googleai/                   # Gemini AI proxy service
├── analysisMS/                 # Spending analytics + AI insights
│   ├── service/AnalysisService.java
│   └── controller/AnalysisController.java
└── expense-ui/                 # React + Vite frontend
```

---

## 🔮 Key Design Decisions

- **Event-Driven Architecture**: Services communicate exclusively via Kafka topics — no direct HTTP calls between TransactionMS, BudgetMS, and NotificationMS. This ensures loose coupling and fault tolerance.
- **Consumer Groups**: Each consumer uses a named group (`budget-consumer-group`, `notification-consumer-group`) to prevent duplicate message processing when scaled horizontally.
- **AI Fallback**: If AI categorization fails, the transaction is still saved — Kafka publish failures are also caught and logged without rolling back the payment.
- **In-Memory Alert Cache**: NotificationMS stores the last 50 alerts in a thread-safe `ConcurrentLinkedDeque`, which the frontend polls periodically.

---

## 📝 License

This project is built for learning and demonstration purposes.

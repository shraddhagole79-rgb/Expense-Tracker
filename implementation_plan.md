# Personal Expense Tracker — Full-Stack Implementation Plan

A full-stack personal expense tracker with **Java Spring Boot 3** backend, **JWT authentication**, **SQLite** database, and **React (Vite)** frontend.

## Environment Notes

| Tool | Status |
|------|--------|
| Java | ✅ 21.0.10 LTS |
| Node.js | ✅ v24.18.1 |
| npm | ✅ 11.16.0 |
| Maven | ❌ Not installed — will use **Maven Wrapper** (`mvnw`) |

---

## Project Structure

```
Expense Tracker/
├── backend/                         # Spring Boot 3 + SQLite
│   ├── mvnw, mvnw.cmd              # Maven Wrapper (no Maven install needed)
│   ├── pom.xml
│   └── src/main/java/com/tracker/
│       ├── TrackerApplication.java
│       ├── config/                  # Security, JWT, CORS config
│       ├── controller/              # REST API controllers
│       ├── dto/                     # Request/Response DTOs
│       ├── entity/                  # JPA entities
│       ├── repository/              # Spring Data JPA repos
│       ├── service/                 # Business logic
│       └── exception/               # Global error handling
└── frontend/                        # React + Vite
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── api/                     # Axios API client
        ├── components/              # Shared UI components
        ├── context/                 # Auth context (React Context API)
        ├── pages/                   # Page components
        └── App.jsx
```

---

## Backend Architecture

### Tech Stack
- **Spring Boot 3.3.x** + Java 21
- **Spring Security 6** with JWT (using `jjwt` library)
- **Spring Data JPA** + Hibernate
- **SQLite** via `sqlite-jdbc` + `hibernate-community-dialects`
- **Maven Wrapper** for builds (no global Maven needed)

### Database Entities (7 tables)

| Entity | Key Fields |
|--------|-----------|
| `User` | id, username, email, password (BCrypt) |
| `Expense` | id, title, amount, date, category, paymentMethod, userId |
| `Income` | id, source, amount, date, userId |
| `SavingsGoal` | id, name, targetAmount, currentAmount, deadline, userId |
| `SavingsContribution` | id, amount, date, savingsGoalId |
| `PlannedExpense` | id, title, amount, expectedDate, category, userId |
| `Budget` | id, category, monthlyLimit, month, year, userId |
| `Investment` | id, assetName, investedAmount, currentValue, category, userId |

### REST API Endpoints

#### Auth (`/api/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login, returns JWT |

#### Expenses (`/api/expenses`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all user expenses (with optional date/category filters) |
| POST | `/` | Add new expense |
| PUT | `/{id}` | Update expense |
| DELETE | `/{id}` | Delete expense |

#### Income (`/api/income`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all income records |
| POST | `/` | Add income |
| PUT | `/{id}` | Update income |
| DELETE | `/{id}` | Delete income |

#### Savings Goals (`/api/savings`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all savings goals |
| POST | `/` | Create savings goal |
| PUT | `/{id}` | Update savings goal |
| DELETE | `/{id}` | Delete savings goal |
| POST | `/{id}/contribute` | Add contribution to goal |
| GET | `/{id}/contributions` | List contributions for goal |

#### Planned Expenses (`/api/planned-expenses`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List planned expenses |
| POST | `/` | Add planned expense |
| PUT | `/{id}` | Update planned expense |
| DELETE | `/{id}` | Delete planned expense |

#### Budgets (`/api/budgets`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List budgets (optional month/year filter) |
| POST | `/` | Create/update budget |
| DELETE | `/{id}` | Delete budget |

#### Investments (`/api/investments`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List investments |
| POST | `/` | Add investment |
| PUT | `/{id}` | Update investment |
| DELETE | `/{id}` | Delete investment |
| GET | `/summary` | Allocation summary |

#### Dashboard (`/api/dashboard`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/summary` | Total income, expenses, savings, net balance |
| GET | `/recent` | Recent 10 transactions |
| GET | `/charts/category-spending` | Category-wise expense breakdown |
| GET | `/charts/income-vs-expense` | Monthly income vs expense data |
| GET | `/charts/daily-trend` | Daily spending trend (last 30 days) |

### JWT Security Flow
1. User registers → password hashed with BCrypt → stored in SQLite
2. User logs in → credentials validated → JWT access token returned (24h expiry)
3. All API calls include `Authorization: Bearer <token>` header
4. `JwtAuthenticationFilter` validates token on every request
5. CORS configured to allow frontend origin (`http://localhost:5173`)

---

## Frontend Architecture

### Tech Stack
- **React 18** via **Vite**
- **React Router v6** for routing
- **Axios** for HTTP calls
- **Recharts** for charts/graphs
- **Vanilla CSS** — clean, simple design with a soft color palette
- **React Context API** for auth state

### Pages (8 pages)

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Email + password login form |
| Register | `/register` | Username + email + password form |
| Dashboard | `/` | Summary cards, recent transactions, charts |
| Expenses | `/expenses` | Table of expenses + add/edit form |
| Income | `/income` | Table of income + add/edit form |
| Savings | `/savings` | Savings goals with progress bars + contributions |
| Budgets | `/budgets` | Category budgets with spend vs limit bars |
| Investments | `/investments` | Portfolio table + allocation pie chart |

### UI Design Principles
- **Clean & simple** — minimal clutter, good whitespace
- **Soft color palette** — muted blues, greens, light grays
- **Card-based layout** — each section in a rounded card
- **Consistent forms** — simple labels, inputs, and buttons
- **Responsive** — works on desktop and mobile
- **Inter font** from Google Fonts for modern typography

---

## Proposed Changes

### Backend Component

#### [NEW] `backend/pom.xml`
Maven project descriptor with Spring Boot 3.3.x parent, dependencies for Spring Web, Security, Data JPA, SQLite JDBC, Hibernate Community Dialects, jjwt, Lombok, and Validation.

#### [NEW] `backend/src/main/resources/application.properties`
SQLite datasource config, JWT secret, HikariCP pool settings (single connection for SQLite), server port 8080.

#### [NEW] `backend/src/main/java/com/tracker/TrackerApplication.java`
Main Spring Boot entry point.

#### [NEW] `backend/src/main/java/com/tracker/entity/*.java`
8 JPA entity classes: User, Expense, Income, SavingsGoal, SavingsContribution, PlannedExpense, Budget, Investment.

#### [NEW] `backend/src/main/java/com/tracker/repository/*.java`
8 Spring Data JPA repository interfaces with custom query methods.

#### [NEW] `backend/src/main/java/com/tracker/dto/*.java`
Request/Response DTOs for auth (LoginRequest, RegisterRequest, AuthResponse) and entities.

#### [NEW] `backend/src/main/java/com/tracker/config/SecurityConfig.java`
Spring Security 6 config with SecurityFilterChain bean, CORS, stateless sessions, and JWT filter registration.

#### [NEW] `backend/src/main/java/com/tracker/config/JwtUtil.java`
JWT utility class — generate, validate, extract claims using jjwt.

#### [NEW] `backend/src/main/java/com/tracker/config/JwtAuthenticationFilter.java`
OncePerRequestFilter to intercept requests and validate JWT from Authorization header.

#### [NEW] `backend/src/main/java/com/tracker/service/*.java`
Service classes for each entity + UserDetailsService implementation.

#### [NEW] `backend/src/main/java/com/tracker/controller/*.java`
REST controllers: AuthController, ExpenseController, IncomeController, SavingsController, PlannedExpenseController, BudgetController, InvestmentController, DashboardController.

#### [NEW] `backend/src/main/java/com/tracker/exception/GlobalExceptionHandler.java`
@ControllerAdvice for consistent error responses.

---

### Frontend Component

#### [NEW] `frontend/` (via Vite)
Scaffolded with `npx create-vite@latest ./ --template react`.

#### [NEW] `frontend/src/api/axios.js`
Axios instance with base URL `http://localhost:8080/api`, request interceptor to attach JWT from localStorage.

#### [NEW] `frontend/src/context/AuthContext.jsx`
React Context for authentication state — login, logout, token persistence.

#### [NEW] `frontend/src/components/*.jsx`
Shared components: Navbar, Sidebar, ProtectedRoute, Modal, FormInput, Card, LoadingSpinner.

#### [NEW] `frontend/src/pages/*.jsx`
8 page components: Login, Register, Dashboard, Expenses, Income, Savings, Budgets, Investments.

#### [NEW] `frontend/src/index.css`
Global styles — soft color palette, card styles, form styles, responsive layout, Inter font.

---

## User Review Required

> [!IMPORTANT]
> **Maven is not installed** on your system. I will use the **Maven Wrapper** (`mvnw.cmd`) which downloads Maven automatically — no installation needed. The first build will take a few minutes to download dependencies.

> [!NOTE]
> The backend will run on **port 8080** and the frontend on **port 5173** (Vite default). The backend CORS config will allow the frontend origin.

## Open Questions

> [!IMPORTANT]
> **Expense categories**: I'll use a fixed set of categories (Food, Transport, Housing, Entertainment, Health, Shopping, Education, Bills, Other). Do you want custom categories that users can create themselves?

> [!IMPORTANT]
> **Payment methods**: I'll use fixed options (Cash, Credit Card, Debit Card, UPI, Bank Transfer, Other). Is this fine?

> [!NOTE]
> **Investment categories**: I'll default to (Stocks, Mutual Funds, Fixed Deposit, Gold, Crypto, Real Estate, Other). Sound good?

---

## Verification Plan

### Automated Tests
```bash
# Backend — compile and run
cd backend && mvnw.cmd spring-boot:run

# Frontend — dev server
cd frontend && npm run dev
```

### Manual Verification
1. Register a user and login — verify JWT returned
2. Add expenses, income, savings goals — verify data persists in SQLite
3. View dashboard — verify summary cards and charts render correctly
4. Test budgets — verify spend tracking against limits
5. Test investments — verify portfolio and allocation chart
6. Test responsive layout on different screen sizes

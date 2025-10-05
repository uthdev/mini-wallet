# Mini Wallet Application

A production-grade Bitcoin wallet service built with NestJS, GraphQL, and BlockCypher API integration.

## 🌐 Live Demo

**Deployed Application**: https://mini-wallet-production.up.railway.app

**GraphQL Playground**: https://mini-wallet-production.up.railway.app/graphql

## 🚀 Features

- **Create Wallet** - Generate Bitcoin testnet wallet addresses
- **Check Balance** - Fetch real-time wallet balance from blockchain
- **Send Funds** - Transfer Bitcoin on testnet network
- **Transaction History** - View and track transaction status

## 🛠 Tech Stack

- **Backend**: NestJS (Node.js framework)
- **API**: GraphQL with Apollo Server
- **Database**: PostgreSQL with TypeORM
- **Blockchain**: BlockCypher API (Bitcoin Testnet)
- **Authentication**: JWT with Passport
- **Testing**: Jest (Unit + E2E tests)
- **DevOps**: Docker, Docker Compose

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 15+
- pnpm
- Docker (optional)

## 🔧 Setup Instructions

### Local Development

1. **Clone the repository**

```bash
git clone https://github.com/uthdev/mini-wallet
cd mini-wallet
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME=walletdb

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_SECRET=your_encryption_secret_here

# BlockCypher API
BLOCKCYPHER_BASE_URL=https://api.blockcypher.com/v1/btc/test3
BLOCKCYPHER_TOKEN=your_blockcypher_token

# App
PORT=3000
```

4. **Start PostgreSQL** (if not using Docker)

```bash
# Using Docker
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

5. **Run the application**

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod
```

### Docker Setup

```bash
# Local development
docker compose -f docker-compose.local.yml up -d

# Production (uses environment variables)
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## 🧪 Testing

### Running Tests

```bash
# Start test database (required for e2e tests)
docker compose -f docker-compose.test.yml up -d

# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov

# Run all tests
pnpm test:all

# Stop test database
docker compose -f docker-compose.test.yml down
```

## 📚 API Documentation

### GraphQL Playground

Access GraphQL Playground at: `http://localhost:3000/graphql`

### Authentication

All wallet and transaction operations require JWT authentication.

#### Register

```graphql
mutation {
  register(input: {
    email: "user@example.com"
    password: "Password123"
    name: "John Doe"
  }) {
    accessToken
    user {
      id
      email
      name
    }
  }
}
```

#### Login

```graphql
mutation {
  login(input: {
    email: "user@example.com"
    password: "Password123"
  }) {
    accessToken
    user {
      id
      email
    }
  }
}
```

#### Get Current User

```graphql
query {
  me {
    id
    email
    name
  }
}
```

### Wallet Operations

**Note**: Add Authorization header: `Bearer <your_token>`

#### Create Wallet

```graphql
mutation {
  createWallet {
    id
    address
    balance
  }
}
```

#### Get My Wallets

```graphql
query {
  myWallets {
    id
    address
    balance
  }
}
```

#### Refresh Wallet Balance

```graphql
mutation {
  refreshWalletBalance(walletId: "wallet-id-here") {
    id
    address
    balance
  }
}
```

### Transaction Operations

#### Send Funds

```graphql
mutation {
  createTransaction(input: {
    walletId: "wallet-id-here"
    toAddress: "recipient-address"
    amountBtc: 0.0001
  }) {
    id
    fromAddress
    toAddress
    amount
    status
    txHash
    createdAt
  }
}
```

#### Get Wallet Transactions

```graphql
query {
  walletTransactions(walletId: "wallet-id-here") {
    id
    fromAddress
    toAddress
    amount
    status
    txHash
    createdAt
  }
}
```

#### Refresh Transaction Status

```graphql
mutation {
  refreshTransactionStatus(txId: "transaction-id-here") {
    id
    status
    txHash
  }
}
```

## 🏗 Architecture & Design Decisions

### Architecture Overview

```
src/
├── auth/           # JWT authentication & authorization
├── users/          # User management
├── wallet/         # Wallet operations
├── transactions/   # Transaction management
└── config/         # Configuration & validation
```

### Key Design Decisions

1. **NestJS Framework**: Chosen for its modular architecture, built-in dependency injection, and TypeScript support
2. **GraphQL**: Provides flexible API queries and strong typing
3. **PostgreSQL**: Reliable relational database for transactional data
4. **BlockCypher API**: Free tier with testnet support, no private key management needed
5. **JWT Authentication**: Stateless authentication for scalability
6. **TypeORM**: Type-safe database operations with migrations support

### Security Measures

- Environment variables for sensitive data
- Password hashing with bcrypt
- JWT token-based authentication
- Input validation with class-validator
- Auth guards on protected endpoints
- CORS configuration
- No private key storage (BlockCypher manages keys)

## 🚀 Deployment

### Environment Setup

1. Set up PostgreSQL database
2. Configure environment variables
4. Deploy application

### Deployment Platforms

- **Render**: Connect GitHub repo

## 📊 Test Coverage

Current test coverage: **>70%**

- Unit tests for all services and resolvers
- E2E tests for authentication and API endpoints
- Mocked external API calls in unit tests

## 🔐 Security Best Practices

- ✅ Environment variables for secrets
- ✅ JWT authentication
- ✅ Password hashing
- ✅ Input validation
- ✅ SQL injection prevention (TypeORM)
- ✅ CORS configuration

## 📝 License

MIT

## 👤 Author

Your Name - [GitHub](https://github.com/uthdev)

## 🙏 Acknowledgments

- NestJS Framework
- BlockCypher API
- Bitcoin Testnet

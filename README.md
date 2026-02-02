
# play-money-prediction-app
Full-stack prediction market platform inspired by Polymarket. Built with React, Node.js, Express &amp; MongoDB. Users can predict outcomes using virtual points, track their performance, and compete on leaderboards.
=======
# 🎯 Mini Prediction Market (Play Money)

A full-stack prediction market platform inspired by Polymarket, built with the MERN stack (MongoDB, Express, React, Node.js). Trade on future events using virtual points in a sleek, modern interface.

## ✨ Features

- **🎨 Premium Dark Theme**: Modern UI inspired by Polymarket with bold percentages and smooth animations
- **📊 Real-Time Odds**: Dynamic probability calculations based on parimutuel betting pools
- **👤 User Profiles**: Track your balance, betting history, and profit/loss
- **🏆 Leaderboard**: Compete with other traders and climb the rankings
- **💰 Virtual Currency**: Start with 1000 points and grow your portfolio
- **🔒 Atomic Transactions**: Race-condition-safe betting with MongoDB atomic operations
- **📱 Responsive Design**: Beautiful on desktop, tablet, and mobile
- **⚡ Skeleton Loading**: Premium loading states for instant perceived performance

## 🛠 Tech Stack

### Frontend
- **React 19** with Vite for blazing-fast development
- **Tailwind CSS 4** for modern, utility-first styling
- **Lucide React** for beautiful icons
- **React Router** for seamless navigation
- **Axios** for API communication

### Backend
- **Node.js** with Express 5
- **MongoDB** with Mongoose for data persistence
- **CORS** enabled for cross-origin requests
- **Atomic operations** for concurrency safety

### DevOps
- **Docker Compose** for one-command deployment
- **Jest & Supertest** for comprehensive API testing
- **Nodemon** for hot-reload development

## 🎲 Design Decisions & Trade-offs

### Betting System: Parimutuel (Pool-Based)
Instead of a complex order book with bid/ask spreads (hard to build in 2 days with low liquidity), I chose a **parimutuel system**:

- **How it works**: All bets go into outcome-specific pools (Yes/No)
- **Implied probability**: Calculated as `Pool / Total Pool` (e.g., 500/1000 = 50%)
- **Payout**: Winners share the total pool proportional to their bet size

**Pros**:
- ✅ Guaranteed liquidity (you can always bet)
- ✅ Simple to understand and implement
- ✅ Automatic fair odds based on market sentiment
- ✅ No spread or slippage issues

**Cons**:
- ❌ Final payout unknown until market closes (odds can shift)
- ❌ No ability to "sell" your position early

### Concurrency & Safety
- **Atomic Transactions**: Used MongoDB `findOneAndUpdate` with `$inc` to handle bet placement
- **Why it matters**: Prevents double-spending and ensures pool totals remain accurate under high load
- **Implementation**: Balance check and deduction happen in a single atomic operation

```javascript
const user = await User.findOneAndUpdate(
    { _id: userId, points: { $gte: amount } },
    { $inc: { points: -amount } },
    { new: true }
);
```

### Simple Authentication
- **Username-only login** (no passwords)
- **Why**: Speeds up development and perfect for a demo/play-money app
- **Production note**: Would add JWT tokens + bcrypt hashing for real deployment

## 📦 Setup & Run

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** running locally at `mongodb://localhost:27017`
  - Or update `MONGO_URI` in `server/.env`

### Option 1: Manual Setup

#### 1. Backend Setup
```bash
cd server
npm install

# Seed the database with sample markets
node seed.js

# Start the server
npm run dev
```
Server runs on `http://localhost:5000`

#### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:5173`

### Option 2: Docker Setup (Recommended)

```bash
# Start all services (MongoDB + Backend + Frontend)
docker-compose up

# Or run in detached mode
docker-compose up -d
```

Access the app at `http://localhost:5173`

## 🧪 Running Tests

```bash
cd server
npm test
```

**Test Coverage**:
- ✅ User creation with 1000 starting points
- ✅ Market creation and listing
- ✅ Prediction placement with balance validation
- ✅ Insufficient balance rejection
- ✅ Negative amount rejection
- ✅ Leaderboard sorting
- ✅ Market resolution and payout distribution

## 📸 Screenshots

### Market List
> **TODO**: Add screenshot of home page showing market cards with percentages

### Market Detail
> **TODO**: Add screenshot of market detail page with prediction form

### Leaderboard
> **TODO**: Add screenshot of leaderboard with top traders

### User Profile
> **TODO**: Add screenshot of profile page with betting history

## 🔌 API Endpoints

### Users
- `POST /api/users` - Create or login user
- `GET /api/users/:username` - Get user profile and history
- `GET /api/leaderboard` - Get top 10 users by points

### Markets
- `GET /api/markets` - List all markets
- `GET /api/markets/:id` - Get market details
- `POST /api/markets` - Create new market (admin/seed)
- `POST /api/markets/:id/resolve` - Resolve market and distribute payouts

### Orders
- `POST /api/orders` - Place a prediction

## 🎯 Bonus Features Implemented

- ✅ **Simple Authentication**: Username-only login with localStorage persistence
- ✅ **Prevent Betting After Close**: Server-side validation of `closesAt` timestamp
- ✅ **Implied Odds Display**: Real-time percentage calculations shown prominently
- ✅ **Skeleton Loading**: Premium loading states instead of "Loading..." text
- ✅ **Backend Tests**: Comprehensive Jest test suite
- ✅ **Docker Setup**: One-command deployment with docker-compose

## 🚀 What I Would Improve With More Time

### Features
1. **Real-time updates** with WebSockets for live odds changes
2. **Market creation UI** for users to propose new markets
3. **Pagination** for markets list (currently loads all)
4. **Advanced filtering** by category, volume, closing date
5. **Chart visualization** of odds history over time
6. **Social features**: comments, likes, market sharing

### Technical
1. **JWT authentication** with refresh tokens
2. **Rate limiting** to prevent API abuse
3. **Caching layer** (Redis) for frequently accessed data
4. **Database indexes** on frequently queried fields
5. **Error monitoring** (Sentry) for production
6. **CI/CD pipeline** with automated testing and deployment

### UX
1. **Dark/light mode toggle**
2. **Mobile app** (React Native)
3. **Onboarding tutorial** for new users
4. **Push notifications** for market resolutions
5. **Accessibility improvements** (ARIA labels, keyboard navigation)

## 💡 What I Learned from Polymarket

### Conceptual Borrowing
- **Binary outcomes** (Yes/No) for simplicity
- **Prominent percentage display** (69%, 32%) as the main visual
- **Volume indicators** to show market activity
- **Status badges** (Open, Closed, Resolved)
- **Leaderboard** to gamify the experience

### Simplifications Made
- **No order book**: Used parimutuel instead of complex bid/ask matching
- **No crypto**: Play money only, no blockchain integration
- **Manual resolution**: Admin trigger instead of oracle-based resolution
- **Simpler liquidity**: Guaranteed liquidity vs. AMM curves

### Design Adaptations
- **Dark theme** with navy/blue color scheme
- **Bold typography** (Inter font) for modern feel
- **Card-based layout** for easy scanning
- **Skeleton loading** for perceived performance
- **Micro-interactions** (hover effects, button animations)

## 🏗️ Project Structure

```
prediction-market/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Navbar, etc.
│   │   ├── pages/         # Home, MarketDetail, Leaderboard, Profile
│   │   ├── api/           # Axios client
│   │   └── index.css      # Global styles + dark theme
│   ├── Dockerfile
│   └── package.json
├── server/                # Express backend
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── tests/             # Jest tests
│   ├── seed.js            # Database seeding
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml     # Multi-container setup
└── README.md
```



## 📄 License

MIT License - feel free to use this for learning purposes.

---



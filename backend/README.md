# Hockey App Backend - Phase 1

Backend API server for the Hockey Coaching Application.

## Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Server will run on:** `http://localhost:5000`

## Available Endpoints

### Health Check
```
GET http://localhost:5000/api/health
```

### Get Team Players
```
GET http://localhost:5000/api/teams/:teamId/players
```

**Example:**
```
GET http://localhost:5000/api/teams/7c9e6679-7425-40de-944b-e07fc1f90ae7/players
```

**Response:**
```json
{
  "players": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "teamId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "firstName": "Connor",
      "lastName": "Williams",
      "jerseyNumber": 87,
      "position": "center",
      "status": "active"
    }
  ]
}
```

### Get Team Dashboard
```
GET http://localhost:5000/api/teams/:teamId/dashboard
```

**Example:**
```
GET http://localhost:5000/api/teams/7c9e6679-7425-40de-944b-e07fc1f90ae7/dashboard
```

**Response:**
```json
{
  "team": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "name": "University Wildcats",
    "division": "NCAA Division I",
    "season": "2025-2026"
  },
  "stats": {
    "totalPlayers": 5,
    "activePlayers": 4,
    "injuredPlayers": 1,
    "totalGames": 4,
    "wins": 1,
    "losses": 0,
    "ties": 1,
    "upcomingGames": 2,
    "totalVideos": 2,
    "totalPractices": 1
  },
  "nextGame": { ... },
  "nextPractice": { ... }
}
```

## Sample Team ID

Use this team ID for testing:
```
7c9e6679-7425-40de-944b-e07fc1f90ae7
```

## Project Structure

```
backend/
├── index.js              # Server entry point
├── routes/               # API route definitions
│   └── teamRoutes.js
├── controllers/          # Request handlers
│   └── teamController.js
├── models/              # Data access layer
│   └── teamModel.js
├── data/                # Mock database
│   └── mockDatabase.js
├── package.json
└── .env
```

## CORS Configuration

CORS is enabled for all origins to allow the React frontend to communicate with the backend.

## Next Steps

- Add authentication endpoints (Phase 1)
- Implement POST/PATCH/DELETE operations (Phase 2)
- Replace mock data with PostgreSQL (Phase 2+)

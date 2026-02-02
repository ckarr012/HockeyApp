# Authentication & Database Testing Guide

## Overview

The Hockey App now has full authentication with SQLite database backend. Each coach logs in and sees only their team's data.

---

## Quick Start

### 1. Start Backend Server

```bash
cd backend
npm start
```

**Note:** If port 5000 is already in use, stop the old server first.

### 2. Start Frontend

```bash
npm run dev
```

Navigate to http://localhost:5173 (or the port shown)

---

## Testing Authentication Flow

### Step 1: Login Screen

When you first load the app, you'll see the login screen with:
- Username input field
- Two quick login buttons (Coach Dad / Coach Smith)

### Step 2: Login as Coach Dad

**Option A - Quick Login Button:**
Click the "Coach Dad" button

**Option B - Manual Entry:**
1. Type `Dad` in the username field
2. Click "Sign In"

**Expected Result:**
- Login screen disappears
- Main app interface loads
- Header shows: "Coach Dad" and "College Wildcats • 2025-2026"
- Dashboard displays College Wildcats data

### Step 3: View Coach Dad's Data

**Dashboard:**
- Games Played: 3
- Win Rate: 33% (1 win, 0 losses, 1 tie)
- Record: 1-0-1
- Total Players: 5
- Active: 4, Injured: 1
- Next game information

**Roster (click "Team" in sidebar):**
- 5 players displayed:
  1. Connor Williams (#87, Center, Active)
  2. Alex Thompson (#29, Goalie, Active)
  3. Tyler Anderson (#19, Left Wing, Active)
  4. Jake Martinez (#44, Right Defense, **Injured**)
  5. Ryan O'Connor (#12, Right Wing, Active)

### Step 4: Logout

Click the logout icon (arrow) in the top-right corner of the header

**Expected Result:**
- Returns to login screen
- All data cleared from state

### Step 5: Login as Coach Smith

Click the "Coach Smith" quick login button or type `Smith`

**Expected Result:**
- Header shows: "Coach Smith" and "Junior Rangers • 2025-2026"
- **DIFFERENT DATA** appears

### Step 6: View Coach Smith's Data

**Dashboard:**
- Games Played: 3
- Win Rate: 33% (1 win, 1 loss, 0 ties)
- Record: 1-1-0
- Total Players: 5 (all active, none injured)
- **Different** games and schedule

**Roster:**
- **COMPLETELY DIFFERENT** 5 players:
  1. Ethan Johnson (#9, Center, Active)
  2. Noah Davis (#1, Goalie, Active)
  3. Liam Brown (#17, Left Wing, Active)
  4. Mason Wilson (#5, Left Defense, Active)
  5. Lucas Taylor (#22, Right Wing, Active)

---

## Data Isolation Verification

### Key Test: Switch Between Coaches

1. Login as **Coach Dad**
2. Note the players on roster (Connor, Alex, Tyler, Jake, Ryan)
3. Note the team stats (1-0-1 record, 1 injured player)
4. Logout
5. Login as **Coach Smith**
6. Verify **COMPLETELY DIFFERENT** players (Ethan, Noah, Liam, Mason, Lucas)
7. Verify **DIFFERENT** stats (1-1-0 record, 0 injured players)

**This confirms data isolation is working correctly!**

---

## Backend API Testing

### Test Login Endpoint Directly

```bash
# Test Coach Dad login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"Dad\"}"

# Test Coach Smith login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"Smith\"}"

# Test invalid user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"InvalidUser\"}"
```

### Test Data Endpoints

After logging in and getting a `teamId` from the response:

```bash
# Replace <TEAM_ID> with actual teamId from login response

# Get players
curl http://localhost:5000/api/teams/<TEAM_ID>/players

# Get dashboard
curl http://localhost:5000/api/teams/<TEAM_ID>/dashboard
```

---

## Troubleshooting

### "User not found" error

**Check:**
- Username is spelled correctly: `Dad` or `Smith` (case-sensitive)
- Database has been seeded: `npm run db:seed`

### Backend not responding

**Check:**
- Backend server is running on port 5000
- No other process is using port 5000
- Restart backend: Stop server, then `npm start`

### CORS errors in browser

**Check:**
- Backend has CORS enabled (should be by default)
- Backend is running on http://localhost:5000
- Frontend API_BASE_URL points to correct backend URL

### Data not updating when switching users

**Check:**
- Browser console for errors
- Network tab shows successful API calls
- Logout button properly clears state
- Components are re-fetching data with new teamId

### Database shows old/wrong data

Reset the database:
```bash
cd backend
npm run db:reset
```

---

## Success Criteria

✅ **Login works for both coaches**
✅ **Each coach sees their own team name in header**
✅ **Dashboard shows different stats for each coach**
✅ **Roster shows different players for each coach**
✅ **Logout returns to login screen**
✅ **Switching coaches shows different data immediately**
✅ **No data leaks between teams**

---

## Next Steps After Successful Testing

### Phase 2 Features to Implement:

1. **Add More Endpoints:**
   - POST /api/teams/:teamId/players (add player)
   - PATCH /api/teams/:teamId/players/:playerId (edit player)
   - DELETE /api/teams/:teamId/players/:playerId (remove player)
   - Similar for games, videos, practices

2. **Enhanced UI:**
   - "Add Player" button functionality
   - Edit player inline
   - Filter/search functionality
   - Video upload interface

3. **Data Validation:**
   - Form validation
   - Required fields
   - Input constraints

4. **Session Persistence:**
   - Store user session in localStorage
   - Auto-login on page refresh
   - Remember last logged-in user

5. **Advanced Features:**
   - Notes system
   - Video tagging
   - Practice plan builder
   - Statistics and analytics

---

## Database Schema Reference

### Users Table
- `id` - UUID primary key
- `username` - Unique login name
- `full_name` - Display name
- `role` - User role (coach, assistant, etc.)
- `team_id` - Foreign key to teams

### Teams Table
- `id` - UUID primary key
- `name` - Team name
- `division` - League division
- `season` - Current season

### Players Table
- `id` - UUID primary key
- `team_id` - Foreign key to teams
- `first_name`, `last_name` - Player name
- `jersey_number` - Jersey #
- `position` - Playing position
- `height`, `weight` - Physical stats
- `shoots` - Left or right
- `status` - active, injured, inactive

### Games Table
- `id` - UUID primary key
- `team_id` - Foreign key to teams
- `opponent` - Opponent team name
- `game_date` - Date/time of game
- `location` - Venue
- `home_away` - home or away
- `status` - scheduled, completed, cancelled
- `team_score`, `opponent_score` - Final scores

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate user |
| GET | `/api/teams/:teamId/players` | Get team roster |
| GET | `/api/teams/:teamId/dashboard` | Get team dashboard data |
| GET | `/api/health` | Health check |

---

## Demo Credentials

| Username | Password | Team | Players | Record |
|----------|----------|------|---------|--------|
| Dad | *(none)* | College Wildcats | 5 (1 injured) | 1-0-1 |
| Smith | *(none)* | Junior Rangers | 5 (all active) | 1-1-0 |

**Note:** No passwords are implemented yet (per requirements)

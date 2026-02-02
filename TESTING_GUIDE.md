# Frontend-Backend Integration Testing Guide

## Current Status
✅ Backend server running on http://localhost:5000  
✅ Frontend components connected to API  
✅ Mock data with 2 teams available for testing

---

## Testing Steps

### 1. Start the Frontend (if not already running)

```bash
npm run dev
```

The React app should run on http://localhost:5173 (or similar)

### 2. View Dashboard with Real Data

**Navigate to:** Dashboard page

**What you should see:**
- Team name: "University Wildcats"
- Season: "2025-2026"
- Games Played: 4
- Win Rate: 25%
- Record: 1-0-1
- Total Players: 5
- Active Players: 4
- Injured Players: 1
- Videos: 2
- Next game information
- Next practice information

**Loading behavior:**
- Should show a blue spinner while loading
- Should display data after ~100-500ms

### 3. View Roster with Real Data

**Navigate to:** Roster page

**What you should see:**
- 5 players from the backend:
  1. Connor Williams (#87, Center, Active)
  2. Alex Thompson (#29, Goalie, Active)
  3. Tyler Anderson (#19, Left Wing, Active)
  4. Jake Martinez (#44, Right Defense, **Injured**)
  5. Ryan O'Connor (#12, Right Wing, Active)

**Loading behavior:**
- Should show a blue spinner while loading
- Players should display with height, weight, shoots, and status badges

---

## Testing Team ID Changes

### Method 1: Change TEAM_ID constant in components

**Dashboard.tsx (line 5):**
```typescript
const TEAM_ID = '8d0a7780-8536-51ef-b05c-f18gd2g01bf8' // Change to State Bears team
```

**Roster.tsx (line 5):**
```typescript
const TEAM_ID = '8d0a7780-8536-51ef-b05c-f18gd2g01bf8' // Change to State Bears team
```

**Expected Result:**
- Dashboard should show empty/different data (State Bears has no players in mock DB)
- Roster should show "No players found" message

### Method 2: Test with Invalid Team ID

Change TEAM_ID to:
```typescript
const TEAM_ID = 'invalid-team-id'
```

**Expected Result:**
- Should show "Team not found" error (404)
- Error message should display in red alert box

### Method 3: Test Backend Offline

1. Stop the backend server (Ctrl+C in backend terminal)
2. Refresh the frontend pages

**Expected Result:**
- Should show error: "Failed to fetch players" or "Failed to fetch dashboard"
- Red error alert should be visible

---

## Verification Checklist

- [ ] Dashboard shows spinner while loading
- [ ] Dashboard displays University Wildcats team data
- [ ] Dashboard shows 5 total players, 4 active, 1 injured
- [ ] Dashboard shows correct game record (1-0-1)
- [ ] Dashboard displays next game information
- [ ] Roster shows spinner while loading
- [ ] Roster displays all 5 players from backend
- [ ] Player status badges show correct colors (green=active, red=injured)
- [ ] Changing TEAM_ID causes data to change/empty
- [ ] Invalid TEAM_ID shows appropriate error message
- [ ] Backend offline shows appropriate error message

---

## Available Backend Endpoints

Test these directly in your browser or with curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Get players for University Wildcats
curl http://localhost:5000/api/teams/7c9e6679-7425-40de-944b-e07fc1f90ae7/players

# Get dashboard for University Wildcats
curl http://localhost:5000/api/teams/7c9e6679-7425-40de-944b-e07fc1f90ae7/dashboard

# Test with invalid team (should return 404)
curl http://localhost:5000/api/teams/invalid-id/players
```

---

## Troubleshooting

### CORS Error
If you see CORS errors in browser console:
- Verify backend is running on port 5000
- Check that CORS is enabled in backend/index.js

### Network Error / Failed to Fetch
- Ensure backend server is running
- Check backend terminal for errors
- Verify API_BASE_URL in src/api/api.ts is correct

### Data Not Updating
- Clear browser cache and reload
- Check browser DevTools Network tab for API calls
- Verify API responses in Network tab

### TypeScript Errors
- Run `npm run build` to check for type errors
- Check that Player and DashboardData interfaces match backend response

---

## Next Steps After Testing

1. **Phase 2 Features:**
   - Add POST/PATCH/DELETE endpoints for players
   - Add games management endpoints
   - Replace mock data with PostgreSQL

2. **UI Improvements:**
   - Add filter functionality in Roster (by position, status)
   - Add search functionality
   - Add edit player functionality

3. **Authentication:**
   - Implement sign-in endpoint
   - Add JWT token handling
   - Store user/team context

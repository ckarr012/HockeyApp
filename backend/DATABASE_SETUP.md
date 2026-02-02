# Database Setup Guide

## Overview

The Hockey App backend now uses **SQLite** (via sql.js) for data persistence with real database tables and relationships.

## Database Schema

### Tables

1. **teams** - Hockey teams
2. **users** - Coaches and staff members
3. **players** - Team roster
4. **games** - Game schedule and results
5. **videos** - Video library
6. **practices** - Practice sessions

### Relationships

- `users.team_id` → `teams.id` (Each user belongs to one team)
- `players.team_id` → `teams.id` (Players belong to teams)
- `games.team_id` → `teams.id` (Games belong to teams)
- `videos.team_id` → `teams.id` (Videos belong to teams)
- `practices.team_id` → `teams.id` (Practices belong to teams)

## Setup Commands

### Initial Setup

```bash
cd backend
npm install
npm run db:reset
```

This will:
1. Run migrations to create all tables
2. Seed the database with sample data

### Individual Commands

```bash
# Run migrations only
npm run db:migrate

# Seed data only (clears existing data first)
npm run db:seed

# Reset database (migrate + seed)
npm run db:reset
```

## Seeded Data

### Two Teams

1. **College Wildcats** (NCAA Division I)
   - 5 players (4 active, 1 injured)
   - 3 games (1 win, 1 tie, 1 scheduled)
   - 2 videos
   - 1 practice session

2. **Junior Rangers** (Junior A)
   - 5 players (all active)
   - 3 games (1 win, 1 loss, 1 scheduled)
   - 1 video
   - 1 practice session

### Two Coaches

| Username | Full Name    | Team             |
|----------|--------------|------------------|
| Dad      | Coach Dad    | College Wildcats |
| Smith    | Coach Smith  | Junior Rangers   |

## Authentication Flow

### Login Process

1. User enters username on login screen
2. Backend queries database: `SELECT * FROM users WHERE username = ?`
3. If found, returns user data with team information
4. Frontend stores user object in state
5. All subsequent API calls use `user.teamId` to fetch team-scoped data

### Data Isolation

**Key Principle:** Each coach only sees their own team's data.

When Coach Dad logs in:
- Dashboard shows College Wildcats stats
- Roster shows College Wildcats players
- All data is filtered by `teamId`

When Coach Smith logs in:
- Dashboard shows Junior Rangers stats
- Roster shows Junior Rangers players
- Completely separate data set

## Database File

- **Location:** `backend/db/hockey.db`
- **Type:** SQLite database file
- **Persistence:** Data persists across server restarts
- **Reset:** Run `npm run db:reset` to clear and reseed

## Query Examples

### Get Team by ID

```sql
SELECT * FROM teams WHERE id = ?
```

### Get Players for Team

```sql
SELECT * FROM players WHERE team_id = ?
```

### Get User with Team Info

```sql
SELECT users.*, teams.name as team_name, teams.division, teams.season
FROM users
JOIN teams ON users.team_id = teams.id
WHERE users.username = ?
```

## API Endpoints

### Authentication

**POST** `/api/auth/login`

Request:
```json
{
  "username": "Dad"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "username": "Dad",
    "fullName": "Coach Dad",
    "role": "coach",
    "teamId": "uuid",
    "teamName": "College Wildcats",
    "division": "NCAA Division I",
    "season": "2025-2026"
  }
}
```

### Team Data

**GET** `/api/teams/:teamId/players`

Returns all players for the specified team.

**GET** `/api/teams/:teamId/dashboard`

Returns comprehensive team statistics and upcoming events.

## Development Notes

### Why sql.js?

- Pure JavaScript implementation (no native compilation needed)
- Works on Windows without Visual Studio C++ build tools
- Perfect for development and prototyping
- Easy to switch to PostgreSQL later (same SQL queries)

### Migration to PostgreSQL

To migrate to PostgreSQL in production:

1. Install `pg` package
2. Update `db/database.js` to use PostgreSQL client
3. Update model queries (minimal changes needed)
4. Set `DATABASE_URL` environment variable
5. Run migrations on production database

## Troubleshooting

### Database file not found

Run `npm run db:reset` to create and seed the database.

### Old data appearing

The database persists data. To reset:
```bash
npm run db:reset
```

### Login fails

Verify database has been seeded:
```bash
npm run db:seed
```

Check usernames are exactly: `Dad` or `Smith` (case-sensitive)

### Empty data on dashboard

Verify you're logged in and `teamId` is being passed correctly.
Check browser console for API errors.

# Hockey Coaching App - Backend API Design

**Version:** 1.0  
**Last Updated:** February 2, 2026  
**Focus:** Product-focused backend design (authentication is for personalization only, not security)

---

## Table of Contents

1. [Core Domain Modeling](#1-core-domain-modeling)
2. [API Endpoints](#2-api-endpoints)
3. [Application Data Flow](#3-application-data-flow)
4. [Backend Architecture](#4-backend-architecture)
5. [Development Roadmap](#5-development-roadmap)

---

## Overview

This document outlines the backend API design for a hockey coaching application that supports multiple users (coaches and staff), where each user manages data for their own team after signing in. The design emphasizes clean API structure, modular routes, and maintainable code.

**Key Principles:**
- Team-scoped data: All API responses are filtered by the authenticated user's team
- Simple authentication: Sign-in is purely for identity and personalization
- RESTful design: Consistent, predictable API patterns
- Incremental development: Phased approach to feature delivery

---

## 1. Core Domain Modeling

### 1.1 Entity Definitions

#### User
Represents coaches, assistant coaches, analysts, trainers, and other staff members.

**Attributes:**
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password_hash` (String)
- `first_name` (String)
- `last_name` (String)
- `role` (Enum: 'head_coach', 'assistant_coach', 'analyst', 'trainer')
- `team_id` (UUID, Foreign Key → Team)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships:**
- Belongs to one `Team`
- Can create many `Notes`

---

#### Team
Represents a hockey team (e.g., college team, professional team).

**Attributes:**
- `id` (UUID, Primary Key)
- `name` (String)
- `division` (String, e.g., "NCAA Division I", "NHL")
- `season` (String, e.g., "2025-2026")
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships:**
- Has many `Users`
- Has many `Players`
- Has many `Games`
- Has many `Practices`
- Has many `Notes`

---

#### Player
Represents an athlete on the team roster.

**Attributes:**
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → Team)
- `first_name` (String)
- `last_name` (String)
- `jersey_number` (Integer)
- `position` (Enum: 'center', 'left_wing', 'right_wing', 'left_defense', 'right_defense', 'goalie')
- `birth_date` (Date)
- `height` (Integer, in cm)
- `weight` (Integer, in kg)
- `shoots` (Enum: 'left', 'right')
- `status` (Enum: 'active', 'injured', 'inactive')
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships:**
- Belongs to one `Team`
- Can have many `Notes`

---

#### Game
Represents a scheduled or completed game.

**Attributes:**
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → Team)
- `opponent` (String)
- `game_date` (DateTime)
- `location` (String)
- `home_away` (Enum: 'home', 'away')
- `status` (Enum: 'scheduled', 'in_progress', 'completed', 'cancelled')
- `team_score` (Integer, nullable)
- `opponent_score` (Integer, nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships:**
- Belongs to one `Team`
- Has many `Videos`
- Has many `Notes`

---

#### Video
Represents video content (game film, practice footage, etc.).

**Attributes:**
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → Team)
- `game_id` (UUID, Foreign Key → Game, nullable)
- `practice_id` (UUID, Foreign Key → Practice, nullable)
- `title` (String)
- `description` (Text, nullable)
- `file_url` (String)
- `duration` (Integer, in seconds)
- `upload_date` (Timestamp)
- `uploaded_by` (UUID, Foreign Key → User)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships:**
- Belongs to one `Team`
- Optionally belongs to one `Game`
- Optionally belongs to one `Practice`
- Uploaded by one `User`

---

#### Note
Represents coaching notes, observations, and comments.

**Attributes:**
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → Team)
- `author_id` (UUID, Foreign Key → User)
- `content` (Text)
- `note_type` (Enum: 'general', 'game', 'player', 'practice')
- `game_id` (UUID, Foreign Key → Game, nullable)
- `player_id` (UUID, Foreign Key → Player, nullable)
- `practice_id` (UUID, Foreign Key → Practice, nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships:**
- Belongs to one `Team`
- Created by one `User`
- Optionally linked to one `Game`
- Optionally linked to one `Player`
- Optionally linked to one `Practice`

---

#### Practice
Represents a practice session with planned drills.

**Attributes:**
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → Team)
- `practice_date` (DateTime)
- `duration` (Integer, in minutes)
- `location` (String)
- `focus` (String, e.g., "Power Play", "Defensive Zone")
- `notes` (Text, nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships:**
- Belongs to one `Team`
- Has many `PracticeDrills` (join table)
- Has many `Drills` (through `PracticeDrills`)

---

#### Drill
Represents a reusable drill template.

**Attributes:**
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → Team)
- `name` (String)
- `description` (Text)
- `category` (Enum: 'skating', 'passing', 'shooting', 'defense', 'power_play', 'penalty_kill', 'conditioning')
- `duration` (Integer, in minutes)
- `diagram_url` (String, nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships:**
- Belongs to one `Team`
- Used in many `Practices` (through `PracticeDrills`)

---

#### PracticeDrill (Join Table)
Links practices to drills with ordering and timing.

**Attributes:**
- `id` (UUID, Primary Key)
- `practice_id` (UUID, Foreign Key → Practice)
- `drill_id` (UUID, Foreign Key → Drill)
- `order` (Integer)
- `planned_duration` (Integer, in minutes)

**Relationships:**
- Belongs to one `Practice`
- Belongs to one `Drill`

---

### 1.2 Entity Relationship Diagram

```
User ──────┐
           │ belongs_to
           ▼
         Team ◄────────────┐
           │               │
           │ has_many      │ belongs_to
           ▼               │
        Player ────────────┘
        
Team ──────┐
           │ has_many
           ▼
         Game ◄────────────┐
           │               │
           │ has_many      │ belongs_to
           ▼               │
        Video ─────────────┘
        
Team ──────┐
           │ has_many
           ▼
       Practice ◄─────────┐
           │              │
           │ has_many     │ belongs_to
           ▼              │
    PracticeDrill ────────┘
           │
           │ belongs_to
           ▼
         Drill
         
Note ──────┐
           │ optionally_linked_to
           ├──► Team
           ├──► Game
           ├──► Player
           └──► Practice
```

---

### 1.3 Key Design Decisions

1. **Team-centric architecture:** All entities are scoped to a `team_id`, enabling clean data isolation
2. **Flexible note system:** Notes can be linked to teams, games, players, or practices for maximum versatility
3. **Reusable drill library:** Drills are templates that can be used across multiple practices
4. **Video metadata storage:** The `Video` entity stores metadata only; actual video files live in external storage
5. **User roles:** Enumerated roles enable future permission systems without breaking the current simple design

---

## 2. API Endpoints

### 2.1 Authentication & User Management

#### POST /api/auth/sign-in
Sign in a user and return a session token.

**Request:**
```json
{
  "email": "coach@university.edu",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "coach@university.edu",
    "first_name": "John",
    "last_name": "Smith",
    "role": "head_coach",
    "team_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
  }
}
```

---

#### POST /api/auth/sign-out
Sign out the current user.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "message": "Successfully signed out"
}
```

---

#### GET /api/users/me
Get the currently authenticated user's profile.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "coach@university.edu",
  "first_name": "John",
  "last_name": "Smith",
  "role": "head_coach",
  "team_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "created_at": "2025-08-15T10:30:00Z"
}
```

---

### 2.2 Team Management

#### GET /api/teams/my-team
Get the authenticated user's team details.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "name": "University Wildcats",
  "division": "NCAA Division I",
  "season": "2025-2026",
  "created_at": "2025-06-01T08:00:00Z"
}
```

---

#### GET /api/teams/my-team/staff
Get all staff members for the authenticated user's team.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "staff": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "first_name": "John",
      "last_name": "Smith",
      "role": "head_coach",
      "email": "coach@university.edu"
    },
    {
      "id": "660f9511-f39c-52e5-b827-557766551111",
      "first_name": "Sarah",
      "last_name": "Johnson",
      "role": "assistant_coach",
      "email": "sjohnson@university.edu"
    }
  ]
}
```

---

### 2.3 Player/Roster Management

#### GET /api/players
Get all players for the authenticated user's team.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `status` (optional): Filter by player status ('active', 'injured', 'inactive')
- `position` (optional): Filter by position

**Response (200 OK):**
```json
{
  "players": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "first_name": "Connor",
      "last_name": "Williams",
      "jersey_number": 87,
      "position": "center",
      "birth_date": "2004-03-15",
      "height": 185,
      "weight": 88,
      "shoots": "left",
      "status": "active"
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "first_name": "Alex",
      "last_name": "Thompson",
      "jersey_number": 29,
      "position": "goalie",
      "birth_date": "2003-11-22",
      "height": 188,
      "weight": 92,
      "shoots": "left",
      "status": "active"
    }
  ]
}
```

---

#### GET /api/players/:id
Get a specific player by ID.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "team_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "first_name": "Connor",
  "last_name": "Williams",
  "jersey_number": 87,
  "position": "center",
  "birth_date": "2004-03-15",
  "height": 185,
  "weight": 88,
  "shoots": "left",
  "status": "active",
  "created_at": "2025-08-15T10:30:00Z",
  "updated_at": "2025-08-15T10:30:00Z"
}
```

---

#### POST /api/players
Create a new player for the authenticated user's team.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "first_name": "Tyler",
  "last_name": "Anderson",
  "jersey_number": 19,
  "position": "left_wing",
  "birth_date": "2005-01-10",
  "height": 180,
  "weight": 82,
  "shoots": "left",
  "status": "active"
}
```

**Response (201 Created):**
```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "team_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "first_name": "Tyler",
  "last_name": "Anderson",
  "jersey_number": 19,
  "position": "left_wing",
  "birth_date": "2005-01-10",
  "height": 180,
  "weight": 82,
  "shoots": "left",
  "status": "active",
  "created_at": "2026-02-02T14:22:00Z",
  "updated_at": "2026-02-02T14:22:00Z"
}
```

---

#### PATCH /api/players/:id
Update a player's information.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "status": "injured",
  "weight": 84
}
```

**Response (200 OK):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "team_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "first_name": "Connor",
  "last_name": "Williams",
  "jersey_number": 87,
  "position": "center",
  "birth_date": "2004-03-15",
  "height": 185,
  "weight": 84,
  "shoots": "left",
  "status": "injured",
  "updated_at": "2026-02-02T14:25:00Z"
}
```

---

#### DELETE /api/players/:id
Remove a player from the roster.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (204 No Content)**

---

### 2.4 Game/Schedule Management

#### GET /api/games
Get all games for the authenticated user's team.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `status` (optional): Filter by game status ('scheduled', 'in_progress', 'completed', 'cancelled')
- `start_date` (optional): Filter games after this date (ISO 8601)
- `end_date` (optional): Filter games before this date (ISO 8601)

**Response (200 OK):**
```json
{
  "games": [
    {
      "id": "d4e5f6a7-b8c9-0123-def4-567890123456",
      "opponent": "State University Bears",
      "game_date": "2026-02-10T19:00:00Z",
      "location": "Home Arena",
      "home_away": "home",
      "status": "scheduled",
      "team_score": null,
      "opponent_score": null
    },
    {
      "id": "e5f6a7b8-c9d0-1234-ef56-789012345678",
      "opponent": "Tech College Titans",
      "game_date": "2026-02-03T18:00:00Z",
      "location": "Tech Arena",
      "home_away": "away",
      "status": "completed",
      "team_score": 4,
      "opponent_score": 2
    }
  ]
}
```

---

#### POST /api/games
Create a new game.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "opponent": "Regional College Eagles",
  "game_date": "2026-02-15T19:30:00Z",
  "location": "Home Arena",
  "home_away": "home"
}
```

**Response (201 Created):**
```json
{
  "id": "f6a7b8c9-d0e1-2345-f678-901234567890",
  "team_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "opponent": "Regional College Eagles",
  "game_date": "2026-02-15T19:30:00Z",
  "location": "Home Arena",
  "home_away": "home",
  "status": "scheduled",
  "team_score": null,
  "opponent_score": null,
  "created_at": "2026-02-02T14:30:00Z"
}
```

---

#### PATCH /api/games/:id
Update game details or record final score.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "status": "completed",
  "team_score": 5,
  "opponent_score": 3
}
```

**Response (200 OK):**
```json
{
  "id": "d4e5f6a7-b8c9-0123-def4-567890123456",
  "team_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "opponent": "State University Bears",
  "game_date": "2026-02-10T19:00:00Z",
  "location": "Home Arena",
  "home_away": "home",
  "status": "completed",
  "team_score": 5,
  "opponent_score": 3,
  "updated_at": "2026-02-10T21:30:00Z"
}
```

---

### 2.5 Video Management

#### GET /api/videos
Get all videos for the authenticated user's team.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `game_id` (optional): Filter videos by game
- `practice_id` (optional): Filter videos by practice

**Response (200 OK):**
```json
{
  "videos": [
    {
      "id": "a7b8c9d0-e1f2-3456-a789-012345678901",
      "title": "Game vs State Bears - Full Game",
      "description": "Complete game footage",
      "file_url": "https://storage.example.com/videos/game-2026-02-03.mp4",
      "duration": 7200,
      "game_id": "e5f6a7b8-c9d0-1234-ef56-789012345678",
      "practice_id": null,
      "upload_date": "2026-02-04T09:00:00Z",
      "uploaded_by": "550e8400-e29b-41d4-a716-446655440000"
    }
  ]
}
```

---

#### POST /api/videos
Upload video metadata (actual file upload handled separately via media storage).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "title": "Power Play Practice Drills",
  "description": "Focus on 5-on-4 scenarios",
  "file_url": "https://storage.example.com/videos/practice-2026-02-05.mp4",
  "duration": 3600,
  "game_id": null,
  "practice_id": "b8c9d0e1-f2a3-4567-b890-123456789012"
}
```

**Response (201 Created):**
```json
{
  "id": "c9d0e1f2-a3b4-5678-c901-234567890123",
  "team_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "title": "Power Play Practice Drills",
  "description": "Focus on 5-on-4 scenarios",
  "file_url": "https://storage.example.com/videos/practice-2026-02-05.mp4",
  "duration": 3600,
  "game_id": null,
  "practice_id": "b8c9d0e1-f2a3-4567-b890-123456789012",
  "upload_date": "2026-02-05T15:00:00Z",
  "uploaded_by": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### 2.6 Notes Management

#### GET /api/notes
Get all notes for the authenticated user's team.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `note_type` (optional): Filter by type ('general', 'game', 'player', 'practice')
- `game_id` (optional): Filter notes linked to a specific game
- `player_id` (optional): Filter notes linked to a specific player
- `practice_id` (optional): Filter notes linked to a specific practice

**Response (200 OK):**
```json
{
  "notes": [
    {
      "id": "d0e1f2a3-b4c5-6789-d012-345678901234",
      "content": "Connor showed excellent positioning in the defensive zone today.",
      "note_type": "player",
      "author_id": "550e8400-e29b-41d4-a716-446655440000",
      "author_name": "John Smith",
      "game_id": null,
      "player_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "practice_id": null,
      "created_at": "2026-02-02T16:45:00Z"
    }
  ]
}
```

---

#### POST /api/notes
Create a new note.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "content": "Need to work on breakout transitions. Too many turnovers in neutral zone.",
  "note_type": "game",
  "game_id": "e5f6a7b8-c9d0-1234-ef56-789012345678",
  "player_id": null,
  "practice_id": null
}
```

**Response (201 Created):**
```json
{
  "id": "e1f2a3b4-c5d6-7890-e123-456789012345",
  "team_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "author_id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Need to work on breakout transitions. Too many turnovers in neutral zone.",
  "note_type": "game",
  "game_id": "e5f6a7b8-c9d0-1234-ef56-789012345678",
  "player_id": null,
  "practice_id": null,
  "created_at": "2026-02-02T16:50:00Z"
}
```

---

### 2.7 Practice & Drill Management

#### GET /api/practices
Get all practices for the authenticated user's team.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `start_date` (optional): Filter practices after this date
- `end_date` (optional): Filter practices before this date

**Response (200 OK):**
```json
{
  "practices": [
    {
      "id": "b8c9d0e1-f2a3-4567-b890-123456789012",
      "practice_date": "2026-02-05T14:00:00Z",
      "duration": 90,
      "location": "Practice Rink A",
      "focus": "Power Play Development",
      "notes": "Focus on quick puck movement",
      "drill_count": 5
    }
  ]
}
```

---

#### GET /api/practices/:id
Get detailed practice plan including drills.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "id": "b8c9d0e1-f2a3-4567-b890-123456789012",
  "team_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "practice_date": "2026-02-05T14:00:00Z",
  "duration": 90,
  "location": "Practice Rink A",
  "focus": "Power Play Development",
  "notes": "Focus on quick puck movement",
  "drills": [
    {
      "id": "f2a3b4c5-d6e7-8901-f234-567890123456",
      "name": "5-on-4 Umbrella Setup",
      "description": "Practice PP1 umbrella formation with emphasis on point shot options",
      "category": "power_play",
      "duration": 15,
      "order": 1,
      "planned_duration": 15
    },
    {
      "id": "a3b4c5d6-e7f8-9012-a345-678901234567",
      "name": "Quick Touch Passing",
      "description": "2-touch max passing drill to improve puck movement speed",
      "category": "passing",
      "duration": 10,
      "order": 2,
      "planned_duration": 12
    }
  ]
}
```

---

#### POST /api/practices
Create a new practice plan.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "practice_date": "2026-02-08T15:00:00Z",
  "duration": 75,
  "location": "Practice Rink B",
  "focus": "Defensive Zone Coverage",
  "notes": "Emphasis on low zone positioning",
  "drill_ids": [
    {
      "drill_id": "b4c5d6e7-f8a9-0123-b456-789012345678",
      "order": 1,
      "planned_duration": 20
    },
    {
      "drill_id": "c5d6e7f8-a9b0-1234-c567-890123456789",
      "order": 2,
      "planned_duration": 15
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": "d6e7f8a9-b0c1-2345-d678-901234567890",
  "team_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "practice_date": "2026-02-08T15:00:00Z",
  "duration": 75,
  "location": "Practice Rink B",
  "focus": "Defensive Zone Coverage",
  "notes": "Emphasis on low zone positioning",
  "created_at": "2026-02-02T17:00:00Z"
}
```

---

#### GET /api/drills
Get all drills in the team's drill library.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `category` (optional): Filter by drill category

**Response (200 OK):**
```json
{
  "drills": [
    {
      "id": "f2a3b4c5-d6e7-8901-f234-567890123456",
      "name": "5-on-4 Umbrella Setup",
      "description": "Practice PP1 umbrella formation with emphasis on point shot options",
      "category": "power_play",
      "duration": 15,
      "diagram_url": "https://storage.example.com/diagrams/pp-umbrella.png"
    },
    {
      "id": "a3b4c5d6-e7f8-9012-a345-678901234567",
      "name": "Quick Touch Passing",
      "description": "2-touch max passing drill to improve puck movement speed",
      "category": "passing",
      "duration": 10,
      "diagram_url": null
    }
  ]
}
```

---

#### POST /api/drills
Create a new drill template.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "name": "Breakout Transition Drill",
  "description": "D-to-D pass, breakout through neutral zone, 2-on-1 finish",
  "category": "skating",
  "duration": 12,
  "diagram_url": "https://storage.example.com/diagrams/breakout-transition.png"
}
```

**Response (201 Created):**
```json
{
  "id": "e7f8a9b0-c1d2-3456-e789-012345678901",
  "team_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "name": "Breakout Transition Drill",
  "description": "D-to-D pass, breakout through neutral zone, 2-on-1 finish",
  "category": "skating",
  "duration": 12,
  "diagram_url": "https://storage.example.com/diagrams/breakout-transition.png",
  "created_at": "2026-02-02T17:10:00Z"
}
```

---

### 2.8 Dashboard & Analytics

#### GET /api/dashboard
Get aggregated dashboard data for the authenticated user's team.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "team": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "name": "University Wildcats",
    "division": "NCAA Division I",
    "season": "2025-2026"
  },
  "stats": {
    "total_players": 25,
    "active_players": 22,
    "injured_players": 3,
    "total_games": 18,
    "wins": 12,
    "losses": 6,
    "upcoming_games": 8,
    "total_videos": 45,
    "total_practices": 32,
    "total_drills": 67
  },
  "next_game": {
    "id": "d4e5f6a7-b8c9-0123-def4-567890123456",
    "opponent": "State University Bears",
    "game_date": "2026-02-10T19:00:00Z",
    "location": "Home Arena",
    "home_away": "home"
  },
  "next_practice": {
    "id": "d6e7f8a9-b0c1-2345-d678-901234567890",
    "practice_date": "2026-02-08T15:00:00Z",
    "focus": "Defensive Zone Coverage",
    "location": "Practice Rink B"
  },
  "recent_notes": [
    {
      "id": "e1f2a3b4-c5d6-7890-e123-456789012345",
      "content": "Need to work on breakout transitions. Too many turnovers in neutral zone.",
      "note_type": "game",
      "author_name": "John Smith",
      "created_at": "2026-02-02T16:50:00Z"
    }
  ]
}
```

---

## 3. Application Data Flow

### 3.1 User Authentication Flow

The application uses a simple token-based authentication system for identifying users and scoping data to their teams.

**Step-by-step flow:**

1. **User Sign-In**
   - User submits credentials via `POST /api/auth/sign-in`
   - Backend validates email and password against the database
   - If valid, backend generates a JWT token containing `user_id` and `team_id`
   - Token and user profile are returned to the client

2. **Token Storage**
   - Client stores the JWT token (typically in localStorage or a secure cookie)
   - Token is included in the `Authorization` header for all subsequent requests

3. **Request Authentication**
   - For each API request, backend middleware validates the JWT token
   - Extracts `user_id` and `team_id` from the token payload
   - Attaches user context to the request object

4. **Data Scoping**
   - All database queries automatically filter by `team_id`
   - Users can only access data belonging to their team
   - Backend enforces team-scoping at the query level to prevent data leakage

**Example Flow Diagram:**

```
┌─────────┐                 ┌─────────────┐                ┌──────────┐
│ Client  │                 │  API Server │                │ Database │
└────┬────┘                 └──────┬──────┘                └────┬─────┘
     │                             │                            │
     │ POST /api/auth/sign-in      │                            │
     ├────────────────────────────►│                            │
     │  { email, password }        │                            │
     │                             │  Query user by email       │
     │                             ├───────────────────────────►│
     │                             │                            │
     │                             │◄───────────────────────────┤
     │                             │  User record (with team_id)│
     │                             │                            │
     │                             │  Generate JWT token        │
     │                             │  (includes user_id,        │
     │                             │   team_id)                 │
     │◄────────────────────────────┤                            │
     │  { token, user }            │                            │
     │                             │                            │
     │ GET /api/players            │                            │
     │ Authorization: Bearer token │                            │
     ├────────────────────────────►│                            │
     │                             │  Validate token            │
     │                             │  Extract team_id           │
     │                             │                            │
     │                             │  SELECT * FROM players     │
     │                             │  WHERE team_id = ?         │
     │                             ├───────────────────────────►│
     │                             │                            │
     │                             │◄───────────────────────────┤
     │                             │  Players for this team only│
     │◄────────────────────────────┤                            │
     │  { players: [...] }         │                            │
     │                             │                            │
```

---

### 3.2 Team Data Scoping Strategy

All API endpoints follow a consistent pattern for scoping data to the authenticated user's team.

**Implementation Pattern:**

```javascript
// Example middleware that extracts team_id from JWT
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.user_id;
    req.teamId = decoded.team_id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Example route that uses team scoping
router.get('/api/players', authenticate, async (req, res) => {
  // req.teamId is automatically available from the token
  const players = await db.query(
    'SELECT * FROM players WHERE team_id = ?',
    [req.teamId]
  );
  
  res.json({ players });
});
```

**Key Principles:**

1. **Implicit Scoping:** The `team_id` is never sent by the client; it's always extracted from the authenticated user's token
2. **Database-Level Filtering:** All queries include `WHERE team_id = ?` to ensure data isolation
3. **Foreign Key Validation:** When creating resources (e.g., a new player), the backend automatically sets `team_id` from the token
4. **No Cross-Team Access:** Users cannot specify or override `team_id` in requests

---

### 3.3 Request/Response Lifecycle

**Typical API Request Flow:**

1. **Client initiates request** with JWT token in Authorization header
2. **Authentication middleware** validates token and extracts user/team context
3. **Route handler** receives request with `req.userId` and `req.teamId` attached
4. **Database query** executes with automatic team filtering
5. **Response** returns only data scoped to the user's team
6. **Client** receives and displays team-specific data

**Example: Creating a New Player**

```
Client Request:
POST /api/players
Authorization: Bearer eyJhbGc...
{
  "first_name": "Tyler",
  "last_name": "Anderson",
  "jersey_number": 19,
  "position": "left_wing"
}

Backend Processing:
1. Validate token → Extract team_id: "7c9e6679-7425-40de-944b-e07fc1f90ae7"
2. Merge team_id into request data
3. INSERT INTO players (team_id, first_name, last_name, ...) VALUES (?, ?, ?, ...)
4. Return created player with team_id included

Response:
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "team_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "first_name": "Tyler",
  "last_name": "Anderson",
  ...
}
```

---

### 3.4 Multi-User Isolation

The backend ensures that different users (even within the same team) see consistent, team-scoped data.

**Scenario: Two Coaches from Different Teams**

```
Coach A (University Wildcats, team_id: "7c9e...")
  └─► GET /api/players
      └─► Returns: 25 players from University Wildcats

Coach B (State Bears, team_id: "8d0a...")
  └─► GET /api/players
      └─► Returns: 23 players from State Bears

Result: Complete data isolation between teams
```

**Scenario: Multiple Staff on the Same Team**

```
Head Coach (team_id: "7c9e...")
  └─► POST /api/notes
      └─► Creates note with author_id = head_coach_id

Analyst (team_id: "7c9e...")
  └─► GET /api/notes
      └─► Returns ALL notes for team, including notes from head coach

Result: Team data is shared among staff members
```

---

### 3.5 Session Management

**Token Lifecycle:**

- **Creation:** Token generated on sign-in, valid for configurable duration (e.g., 7 days)
- **Usage:** Included in every API request via Authorization header
- **Refresh:** Client can request new token before expiration (future enhancement)
- **Revocation:** Token invalidated on sign-out or expiration

**Error Handling:**

| Scenario | Response |
|----------|----------|
| No token provided | 401 Unauthorized |
| Invalid/expired token | 401 Unauthorized |
| Valid token, accessing other team's data | 403 Forbidden (prevented by design) |
| Valid token, resource not found | 404 Not Found |

---

## 4. Backend Architecture

### 4.1 System Overview

The backend follows a simple three-tier architecture optimized for maintainability and clear separation of concerns.

**High-Level Architecture Diagram:**

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                  (React/TypeScript SPA)                      │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/REST
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      API Server                              │
│                   (Node.js/Express)                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Authentication Middleware (JWT)                   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Auth    │  │  Teams   │  │ Players  │  │  Games   │   │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Videos  │  │  Notes   │  │ Practice │  │Dashboard │   │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────┬───────────────────┬────────────────────┘
                     │                   │
                     │ SQL Queries       │ File URLs
                     │                   │
        ┌────────────▼───────┐   ┌───────▼──────────┐
        │    Database        │   │  Media Storage   │
        │  (PostgreSQL)      │   │  (S3/CloudFlare) │
        │                    │   │                  │
        │  - Users           │   │  - Video files   │
        │  - Teams           │   │  - Drill         │
        │  - Players         │   │    diagrams      │
        │  - Games           │   │                  │
        │  - Videos (meta)   │   │                  │
        │  - Notes           │   │                  │
        │  - Practices       │   │                  │
        │  - Drills          │   │                  │
        └────────────────────┘   └──────────────────┘
```

---

### 4.2 Component Details

#### API Server (Node.js + Express)

**Responsibilities:**
- Handle HTTP requests from the frontend
- Authenticate and authorize users
- Validate request data
- Execute business logic
- Query and update the database
- Return JSON responses

**Technology Stack:**
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Authentication:** JWT (jsonwebtoken library)
- **Validation:** express-validator or Joi
- **Database Client:** pg (node-postgres) for PostgreSQL
- **Environment:** dotenv for configuration

**Key Modules:**

```
api-server/
├── src/
│   ├── app.js                 # Express app setup
│   ├── server.js              # Server entry point
│   ├── middleware/
│   │   ├── authenticate.js    # JWT validation
│   │   └── errorHandler.js    # Global error handling
│   ├── routes/
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── teams.js           # Team management
│   │   ├── players.js         # Roster management
│   │   ├── games.js           # Schedule management
│   │   ├── videos.js          # Video metadata
│   │   ├── notes.js           # Notes CRUD
│   │   ├── practices.js       # Practice plans
│   │   ├── drills.js          # Drill library
│   │   └── dashboard.js       # Dashboard data
│   ├── controllers/           # Route handlers
│   ├── models/                # Database models/queries
│   └── utils/
│       ├── jwt.js             # Token generation/validation
│       └── db.js              # Database connection pool
├── package.json
└── .env                       # Configuration
```

---

#### Database (PostgreSQL)

**Responsibilities:**
- Store all application data
- Enforce referential integrity
- Provide efficient queries with indexes
- Support concurrent access

**Schema Organization:**

```sql
-- Core tables
CREATE TABLE teams (...);
CREATE TABLE users (...);
CREATE TABLE players (...);
CREATE TABLE games (...);

-- Content tables
CREATE TABLE videos (...);
CREATE TABLE notes (...);
CREATE TABLE practices (...);
CREATE TABLE drills (...);
CREATE TABLE practice_drills (...);

-- Indexes for performance
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_games_team_id ON games(team_id);
CREATE INDEX idx_videos_team_id ON videos(team_id);
CREATE INDEX idx_notes_team_id ON notes(team_id);
CREATE INDEX idx_practices_team_id ON practices(team_id);
```

**Key Features:**
- UUID primary keys for all entities
- Foreign key constraints to maintain data integrity
- Timestamps (created_at, updated_at) on all tables
- Indexes on team_id columns for fast filtering
- Enum types for status fields (player status, game status, etc.)

---

#### Media Storage (Cloud Storage)

**Responsibilities:**
- Store video files (game footage, practice videos)
- Store drill diagram images
- Serve files via signed URLs or CDN
- Handle large file uploads

**Technology Options:**
- **AWS S3:** Industry standard, good pricing, integrates with CloudFront CDN
- **Cloudflare R2:** S3-compatible, zero egress fees
- **Azure Blob Storage:** Good if using Azure ecosystem

**Integration Pattern:**

1. **Upload Flow:**
   - Client requests a presigned upload URL from API server
   - API server generates presigned URL from storage provider
   - Client uploads file directly to storage (bypasses API server)
   - Client sends video metadata to API server
   - API server stores metadata in database with file URL

2. **Retrieval Flow:**
   - Client requests video list from API server
   - API server returns metadata including file URLs
   - Client uses URLs to stream/download videos directly from storage

**Benefits:**
- Reduces load on API server (files don't pass through it)
- Faster uploads and downloads (direct to storage)
- Scalable storage without API server bottlenecks

---

### 4.3 Request Processing Flow

**Example: GET /api/players request**

```
1. Client Request
   └─► GET /api/players
       Authorization: Bearer <token>

2. API Server Receives Request
   └─► Express routing matches /api/players

3. Authentication Middleware
   └─► Extract and validate JWT token
   └─► Decode token → Extract user_id and team_id
   └─► Attach to request object (req.userId, req.teamId)

4. Route Handler (Controller)
   └─► Get team_id from req.teamId
   └─► Call database model function

5. Database Query
   └─► SELECT * FROM players WHERE team_id = $1
   └─► Return rows to API server

6. Response Formatting
   └─► Convert database rows to JSON
   └─► Return { players: [...] }

7. Client Receives Response
   └─► Display players in UI
```

---

### 4.4 Database Connection Management

**Connection Pooling Strategy:**

```javascript
// db.js - Database connection pool
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,   // Close idle connections
  connectionTimeoutMillis: 2000,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
```

**Benefits:**
- Reuses database connections for better performance
- Limits concurrent connections to avoid overwhelming the database
- Automatically manages connection lifecycle

---

### 4.5 Environment Configuration

**Environment Variables (.env file):**

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hockey_app
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=7d

# Media Storage Configuration (example for S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=hockey-app-videos

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

---

### 4.6 API Error Handling

**Centralized Error Handler:**

```javascript
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  
  // Database errors
  if (err.code === '23505') {
    return res.status(409).json({ 
      error: 'Duplicate entry',
      detail: err.detail 
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: err.errors 
    });
  }
  
  // Default server error
  res.status(500).json({ 
    error: 'Internal server error' 
  });
}

module.exports = errorHandler;
```

---

### 4.7 API Versioning Strategy

For future extensibility, the API uses URL-based versioning:

- Current: `/api/...` (implicit v1)
- Future: `/api/v2/...` when breaking changes are needed

This allows:
- Gradual migration of frontend to new API versions
- Support for multiple frontend versions simultaneously
- Clear deprecation path for old endpoints

---

### 4.8 Scalability Considerations

**Current Architecture (Phase 1):**
- Single API server instance
- Single database instance
- Suitable for 100-1000 users

**Future Scaling Options:**
- **Horizontal API Scaling:** Deploy multiple API server instances behind a load balancer
- **Database Replication:** Add read replicas for query-heavy workloads
- **Caching Layer:** Add Redis for session storage and frequently accessed data
- **CDN:** Serve static assets and videos through CloudFront/Cloudflare
- **Database Partitioning:** Partition by team_id if dataset grows very large

---

## 5. Development Roadmap

### 5.1 Overview

The backend will be developed in three phases, each building on the previous one. This incremental approach allows for early testing, feedback, and course correction.

**Timeline:**
- **Phase 1:** 2-3 weeks (Foundation)
- **Phase 2:** 2-3 weeks (Core Features)
- **Phase 3:** 2-3 weeks (Advanced Features)

---

### 5.2 Phase 1: Foundation (Users + Teams)

**Goal:** Establish the core infrastructure and authentication system.

#### Deliverables:

1. **Database Setup**
   - Install and configure PostgreSQL
   - Create database schema for `teams` and `users` tables
   - Set up database migrations framework (e.g., node-pg-migrate or Prisma)
   - Create seed data for testing (2-3 sample teams with users)

2. **API Server Foundation**
   - Initialize Node.js project with Express
   - Set up project structure (routes, controllers, models, middleware)
   - Configure environment variables with dotenv
   - Implement database connection pooling
   - Set up CORS for frontend communication

3. **Authentication System**
   - Implement JWT token generation and validation
   - Create authentication middleware
   - Build sign-in endpoint (`POST /api/auth/sign-in`)
   - Build sign-out endpoint (`POST /api/auth/sign-out`)
   - Build user profile endpoint (`GET /api/users/me`)

4. **Team Endpoints**
   - `GET /api/teams/my-team` - Fetch authenticated user's team
   - `GET /api/teams/my-team/staff` - List all staff on the team

5. **Testing & Validation**
   - Test authentication flow end-to-end
   - Verify JWT token includes correct `user_id` and `team_id`
   - Confirm team data scoping works correctly
   - Test error handling for invalid credentials

**Success Criteria:**
- Users can sign in and receive a valid JWT token
- Team data is correctly scoped to the authenticated user
- API returns appropriate error messages for invalid requests

---

### 5.3 Phase 2: Core Features (Roster + Schedule)

**Goal:** Add player management and game scheduling capabilities.

#### Deliverables:

1. **Database Extensions**
   - Create `players` table with foreign key to `teams`
   - Create `games` table with foreign key to `teams`
   - Add indexes on `team_id` columns
   - Create seed data for players and games

2. **Player/Roster Management**
   - `GET /api/players` - List all players (with filters)
   - `GET /api/players/:id` - Get specific player details
   - `POST /api/players` - Add new player to roster
   - `PATCH /api/players/:id` - Update player information
   - `DELETE /api/players/:id` - Remove player from roster

3. **Game/Schedule Management**
   - `GET /api/games` - List all games (with filters)
   - `GET /api/games/:id` - Get specific game details
   - `POST /api/games` - Create new game
   - `PATCH /api/games/:id` - Update game (scores, status)
   - `DELETE /api/games/:id` - Cancel/delete game

4. **Dashboard Endpoint**
   - `GET /api/dashboard` - Aggregated team statistics
   - Include player counts, game records, upcoming games

5. **Testing & Validation**
   - Test CRUD operations for players and games
   - Verify team scoping prevents cross-team data access
   - Test query filters (status, position, dates)
   - Performance test with realistic data volumes

**Success Criteria:**
- Coaches can manage their roster (add, edit, remove players)
- Coaches can create and update game schedules
- Dashboard displays accurate team statistics
- All data remains scoped to the user's team

---

### 5.4 Phase 3: Advanced Features (Videos, Notes, Practices)

**Goal:** Add content management and coaching tools.

#### Deliverables:

1. **Database Extensions**
   - Create `videos`, `notes`, `practices`, `drills`, `practice_drills` tables
   - Add foreign key relationships
   - Create indexes for performance
   - Seed sample data

2. **Video Management**
   - Set up cloud storage (S3/R2) integration
   - Implement presigned URL generation for uploads
   - `GET /api/videos` - List videos (with filters)
   - `POST /api/videos` - Upload video metadata
   - `DELETE /api/videos/:id` - Remove video

3. **Notes System**
   - `GET /api/notes` - List notes (with filters by type, linked entity)
   - `POST /api/notes` - Create new note
   - `PATCH /api/notes/:id` - Edit note
   - `DELETE /api/notes/:id` - Delete note

4. **Practice Planning**
   - `GET /api/practices` - List practice sessions
   - `GET /api/practices/:id` - Get practice plan with drills
   - `POST /api/practices` - Create practice plan
   - `PATCH /api/practices/:id` - Update practice
   - `DELETE /api/practices/:id` - Delete practice

5. **Drill Library**
   - `GET /api/drills` - List drills (with category filter)
   - `POST /api/drills` - Create drill template
   - `PATCH /api/drills/:id` - Edit drill
   - `DELETE /api/drills/:id` - Delete drill

6. **Enhanced Dashboard**
   - Add video count, practice count, recent notes to dashboard
   - Display next upcoming practice

7. **Testing & Validation**
   - Test video upload flow with cloud storage
   - Verify notes can be linked to games, players, practices
   - Test practice plan creation with multiple drills
   - Performance test with large video lists

**Success Criteria:**
- Coaches can upload and organize game/practice videos
- Coaches can create notes linked to specific contexts
- Coaches can build practice plans using a drill library
- Dashboard provides comprehensive team overview

---

### 5.5 Development Best Practices

Throughout all phases, maintain these practices:

**1. Code Quality**
- Write modular, reusable code
- Follow consistent naming conventions
- Add inline comments for complex logic
- Use async/await for asynchronous operations

**2. API Design**
- Follow RESTful conventions
- Use appropriate HTTP methods and status codes
- Return consistent JSON response structures
- Include meaningful error messages

**3. Database Management**
- Use parameterized queries to prevent SQL injection
- Create database migrations for schema changes
- Never commit sensitive data or credentials
- Maintain referential integrity with foreign keys

**4. Testing**
- Test each endpoint manually with Postman/Insomnia
- Write integration tests for critical flows
- Test edge cases and error scenarios
- Validate data scoping works correctly

**5. Version Control**
- Commit code frequently with descriptive messages
- Use feature branches for new functionality
- Review code before merging to main branch
- Tag releases for each completed phase

**6. Documentation**
- Keep API documentation up to date
- Document environment variables
- Maintain clear README with setup instructions
- Comment complex business logic

---

### 5.6 Post-MVP Enhancements

After completing the three phases, consider these enhancements:

**Performance & Reliability:**
- Add request rate limiting
- Implement API response caching
- Set up logging and monitoring
- Create database backup strategy

**User Experience:**
- Add password reset flow
- Implement email notifications
- Support file upload progress tracking
- Add bulk operations (e.g., import roster from CSV)

**Features:**
- Player statistics tracking
- Game film tagging/annotation
- Practice attendance tracking
- Drill effectiveness ratings
- Team communication tools
- Calendar integration

**Admin Features:**
- Multi-team management for organizations
- User role permissions (read-only staff, etc.)
- Team season archiving
- Data export functionality

---

### 5.7 Technical Debt Management

As development progresses, track and address technical debt:

**Phase 1 → Phase 2 Transition:**
- Refactor duplicate code into shared utilities
- Optimize database queries based on performance profiling
- Standardize error handling across all routes

**Phase 2 → Phase 3 Transition:**
- Review and optimize database indexes
- Implement automated testing suite
- Set up CI/CD pipeline

**Post-Phase 3:**
- Conduct security audit
- Performance optimization pass
- Code review and refactoring
- Documentation cleanup

---

### 5.8 Success Metrics

**Phase 1:**
- Authentication works reliably
- Zero cross-team data leakage
- API response time < 200ms for simple queries

**Phase 2:**
- All CRUD operations work correctly
- Can handle 1000+ players and games per team
- Dashboard loads in < 500ms

**Phase 3:**
- Video uploads complete successfully
- Practice plans can include 10+ drills
- System handles 100+ videos per team

---

## Conclusion

This backend API design provides a solid foundation for the hockey coaching application. By following the phased development approach, maintaining clean code practices, and focusing on team-scoped data isolation, the backend will be:

- **Maintainable:** Clear structure and modular code
- **Scalable:** Architecture supports future growth
- **Reliable:** Proper error handling and data validation
- **Secure:** Team-based data isolation (product-level security)

The design emphasizes practical implementation over theoretical perfection, enabling rapid development while maintaining code quality. Each phase delivers working functionality that can be tested and refined before moving forward.

---

**Next Steps:**
1. Review this design document with stakeholders
2. Set up development environment (Node.js, PostgreSQL)
3. Begin Phase 1 implementation
4. Establish regular testing and code review cadence


# Ice Hockey Coaching Application - Product Design Document

**Version:** 1.0  
**Date:** February 2026  
**Status:** Design Phase

---

## Table of Contents
1. [Feature Discovery](#1-feature-discovery)
2. [User Roles & Use Cases](#2-user-roles--use-cases)
3. [System Architecture](#3-system-architecture)
4. [Data Models & Database Schema](#4-data-models--database-schema)
5. [API Design](#5-api-design)
6. [UI/UX & User Flows](#6-uiux--user-flows)
7. [Technical Roadmap](#7-technical-roadmap)

---

## 1. Feature Discovery

### MVP (Must-Have for v1)

#### Core Coaching Workflow
- **Game Footage Management**
  - Upload game videos (MP4, MOV formats)
  - Organize videos by game, date, opponent
  - Basic video player with playback controls
  - Video timestamp tagging
  
- **Player & Roster Management**
  - Create and manage team rosters
  - Player profiles (name, position, jersey number, basic info)
  - Player grouping by lines/units
  - Active/inactive roster status

- **Coaching Notes & Observations**
  - Create text-based notes linked to games or players
  - Tag notes by category (offense, defense, special teams)
  - Search and filter notes
  - Attach notes to specific video timestamps

- **Practice Planning**
  - Create practice plans with time blocks
  - Basic drill library (name, description, duration)
  - Add drills to practice schedule
  - Print/export practice plans

- **Game Schedule & Calendar**
  - Add games with opponent, date, time, location
  - Calendar view (month/week)
  - Mark games as home/away
  - Link uploaded footage to scheduled games

- **Line Combinations**
  - Drag-and-drop line builder
  - Save multiple line combinations
  - Forward lines, defensive pairings, special teams
  - Export line sheets

### Phase 2 (Useful Enhancements)

#### Advanced Video Features
- **Video Analysis Tools**
  - Frame-by-frame advancement
  - Slow motion playback (0.25x, 0.5x, 0.75x)
  - Video clipping (save segments)
  - Drawing tools on frozen frames (arrows, circles, lines)
  - Side-by-side video comparison

- **Advanced Tagging System**
  - Tag plays by type (goal, penalty, faceoff, turnover)
  - Tag players involved in plays
  - Create highlight reels from tagged segments
  - Filter video by tags

#### Performance Tracking
- **Basic Stats Dashboard**
  - Goals, assists, plus/minus per player
  - Ice time tracking (manual entry)
  - Game-by-game performance trends
  - Team statistics aggregation

- **Scouting Reports**
  - Create opponent scouting templates
  - Track opponent tendencies
  - Link scouting notes to opponent footage
  - Scouting report generator

#### Team Communication
- **Announcements & Notifications**
  - Post team announcements
  - Practice/game reminders
  - Schedule changes
  - Read receipts

- **Resource Sharing**
  - Share practice plans with assistant coaches
  - Share video clips with specific staff members
  - Comments and feedback on shared items

### Future Ideas (Post-Launch)

- **Advanced Analytics**
  - Shot charts and heat maps
  - Possession metrics
  - Zone entry/exit tracking
  - Faceoff win percentage by zone

- **AI-Powered Features**
  - Automatic play detection (goals, penalties)
  - Player recognition in video
  - Suggested drills based on weaknesses
  - Performance prediction models

- **Mobile Applications**
  - Native iOS and Android apps
  - Offline video viewing
  - Quick note-taking from bench
  - Live game stat tracking

- **Integration Features**
  - Import stats from league management systems
  - Export to video editing software
  - Calendar sync with Google/Outlook
  - Wearable device integration (heart rate, GPS)

- **Player Development Tracking**
  - Skill progression tracking
  - Goal setting and achievement tracking
  - Development plans per player
  - Progress reports for parents/management

---

## 2. User Roles & Use Cases

### User Roles

#### 1. Head Coach
**Permissions:** Full access to all features

**Primary Actions:**
- Upload and review game footage
- Create and edit practice plans
- Build line combinations
- Create coaching notes and strategies
- Review player performance data
- Manage team roster
- Post team announcements
- Grant access to other staff members

**Key Screens:**
- Dashboard (overview of upcoming games, recent footage, team stats)
- Video library and player
- Practice planner
- Line combination builder
- Player profiles
- Game schedule

**Typical Workflow:**
1. Upload game footage after game
2. Review footage, tag key plays
3. Create notes on team/player performance
4. Identify areas for improvement
5. Build practice plan targeting weaknesses
6. Set line combinations for next game
7. Share notes with assistant coaches

---

#### 2. Assistant Coach
**Permissions:** Can create/edit content, limited admin features

**Primary Actions:**
- View and comment on game footage
- Create practice drills and plans
- Add coaching notes
- View and suggest line combinations
- Track specific areas (e.g., special teams)
- Create scouting reports

**Key Screens:**
- Video library
- Practice planner
- Drill library
- Scouting reports
- Notes dashboard

**Typical Workflow:**
1. Review assigned game footage (e.g., power play)
2. Create detailed notes on special teams performance
3. Build specialty drills for practice
4. Prepare scouting report on next opponent
5. Collaborate with head coach on game plan

---

#### 3. Trainer/Athletic Trainer
**Permissions:** View roster, limited access to performance data

**Primary Actions:**
- View player profiles
- Track player injuries (if implemented)
- View practice schedule
- Access to fitness/performance metrics
- View announcements

**Key Screens:**
- Player roster
- Practice schedule
- Announcements

**Typical Workflow:**
1. Check practice schedule
2. Review player status
3. Coordinate with coaches on player availability
4. Monitor workload and recovery

---

#### 4. Video Analyst
**Permissions:** Full video access, can create reports

**Primary Actions:**
- Upload and organize game footage
- Create detailed video breakdowns
- Tag and clip plays
- Build highlight reels
- Create opponent scouting videos
- Advanced video editing and analysis

**Key Screens:**
- Video upload and management
- Video tagging interface
- Clip creation tool
- Video export

**Typical Workflow:**
1. Capture and upload game footage
2. Organize by game and opponent
3. Tag all significant plays
4. Create breakdown videos for coaches
5. Build opponent tendency videos
6. Prepare highlight packages

---

#### 5. Player (Limited Access)
**Permissions:** View-only for assigned content

**Primary Actions:**
- View personal performance stats
- Watch assigned video clips
- View practice schedule
- Read team announcements
- Access assigned drills and resources

**Key Screens:**
- Personal dashboard
- Assigned video clips
- Practice schedule
- Team calendar
- Announcements

**Typical Workflow:**
1. Check upcoming schedule
2. Review personal video assignments
3. Watch clips and coaching points
4. Review practice plan
5. Read team announcements

---

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│  ┌────────────────────────────────────────────────┐    │
│  │   React Web Application (SPA)                   │    │
│  │   - Modern UI with TailwindCSS & shadcn/ui     │    │
│  │   - State management (Zustand/Redux)           │    │
│  │   - Video player (Video.js/Plyr)               │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTPS/REST API
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                      │
│  ┌────────────────────────────────────────────────┐    │
│  │   Node.js + Express API Server                  │    │
│  │   - RESTful endpoints                           │    │
│  │   - Business logic                              │    │
│  │   - Request validation                          │    │
│  │   - File upload handling (Multer)               │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                     DATA LAYER                           │
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │  PostgreSQL Database │  │  Media Storage (S3)  │    │
│  │  - Structured data   │  │  - Video files       │    │
│  │  - Relationships     │  │  - Images            │    │
│  │  - Transactions      │  │  - Documents         │    │
│  └──────────────────────┘  └──────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Component Responsibilities

#### Frontend (React Web Application)
**Technology Stack:**
- React 18+ with TypeScript
- TailwindCSS for styling
- shadcn/ui for component library
- React Router for navigation
- Zustand or Redux for state management
- React Query for server state management
- Video.js or Plyr for video playback
- Axios for API calls

**Responsibilities:**
- Render user interface
- Handle user interactions
- Client-side routing
- Form validation
- Video playback and controls
- Real-time updates (WebSocket for notifications)
- Local state management
- API communication

**Key Features:**
- Responsive design (desktop-first, tablet-optimized)
- Progressive video loading
- Drag-and-drop interfaces
- Rich text editors for notes
- Print-friendly views

---

#### Backend (Node.js + Express API)
**Technology Stack:**
- Node.js (LTS version)
- Express.js framework
- TypeScript for type safety
- JWT for session management
- Multer for file uploads
- Sharp for image processing
- Prisma or TypeORM for database ORM
- Express Validator for input validation

**Responsibilities:**
- Handle HTTP requests
- Business logic execution
- Data validation
- File upload processing
- Database operations (CRUD)
- Generate pre-signed URLs for video access
- API versioning
- Error handling and logging
- Rate limiting

**API Structure:**
- RESTful design principles
- JSON request/response format
- Proper HTTP status codes
- Pagination for list endpoints
- Filtering and sorting capabilities

---

#### Database (PostgreSQL)
**Why PostgreSQL:**
- ACID compliance
- Complex relationships between entities
- JSON support for flexible data
- Full-text search capabilities
- Mature ecosystem and tooling
- Excellent performance for read-heavy workloads

**Responsibilities:**
- Persist structured data
- Maintain data integrity
- Handle relationships (teams, players, games, etc.)
- Support complex queries
- Transaction management
- Full-text search on notes

**Schema Management:**
- Migration-based schema evolution
- Indexed columns for performance
- Foreign key constraints
- Cascade deletes where appropriate

---

#### Media Storage (AWS S3 or Compatible)
**Technology Options:**
- AWS S3 (production)
- MinIO (self-hosted alternative)
- Cloudflare R2 (cost-effective)

**Responsibilities:**
- Store large video files
- Store images and documents
- Serve media with CDN
- Generate time-limited access URLs
- Handle video transcoding (future)

**Organization:**
```
/teams/{team_id}/
  /games/{game_id}/
    /footage/
      original-video.mp4
      thumbnail.jpg
  /players/{player_id}/
    profile-photo.jpg
  /drills/
    drill-diagram.png
```

---

### Communication Flow

#### Video Upload Flow:
1. **Client** requests upload URL from API
2. **API** generates pre-signed S3 upload URL
3. **Client** uploads video directly to S3
4. **Client** notifies API of successful upload
5. **API** creates database record with S3 reference
6. **API** queues video for processing (thumbnail generation)

#### Data Retrieval Flow:
1. **Client** requests data from API endpoint
2. **API** validates request and user permissions
3. **API** queries PostgreSQL database
4. **API** formats response (includes S3 URLs for media)
5. **Client** receives JSON data
6. **Client** requests media directly from S3 using signed URLs

---

## 4. Data Models & Database Schema

### Core Entities

#### 1. Users
Represents all system users (coaches, staff, players).

**Attributes:**
- `id` (UUID, Primary Key)
- `email` (String, Unique, Indexed)
- `first_name` (String)
- `last_name` (String)
- `role` (Enum: head_coach, assistant_coach, trainer, analyst, player)
- `avatar_url` (String, nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships:**
- Belongs to many Teams (through TeamMembers)
- Has many Notes (as author)
- Has many PracticePlans (as creator)

---

#### 2. Teams
Represents a hockey team.

**Attributes:**
- `id` (UUID, Primary Key)
- `name` (String)
- `season` (String, e.g., "2025-2026")
- `division` (String, nullable)
- `logo_url` (String, nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships:**
- Has many Players (through roster)
- Has many Games
- Has many PracticePlans
- Has many TeamMembers (staff)
- Has many LineCombinations

---

#### 3. TeamMembers
Junction table linking users (staff) to teams.

**Attributes:**
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → Teams)
- `user_id` (UUID, Foreign Key → Users)
- `role` (Enum: head_coach, assistant_coach, trainer, analyst)
- `joined_at` (Timestamp)

**Relationships:**
- Belongs to Team
- Belongs to User

---

#### 4. Players
Represents individual players on a roster.

**Attributes:**
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → Teams)
- `user_id` (UUID, Foreign Key → Users, nullable)
- `first_name` (String)
- `last_name` (String)
- `jersey_number` (Integer)
- `position` (Enum: C, LW, RW, D, G)
- `shoots` (Enum: L, R)
- `height` (String, nullable)
- `weight` (Integer, nullable)
- `birth_date` (Date, nullable)
- `status` (Enum: active, inactive, injured)
- `profile_photo_url` (String, nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships:**
- Belongs to Team
- Linked to User (if they have app access)
- Has many PlayerStats
- Referenced in many Notes
- Part of many LineCombinations

---

#### 5. Games
Represents scheduled or completed games.

**Attributes:**
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → Teams)
- `opponent_name` (String)
- `game_date` (DateTime)
- `location` (String)
- `home_away` (Enum: home, away)
- `score_team` (Integer, nullable)
- `score_opponent` (Integer, nullable)
- `status` (Enum: scheduled, completed, cancelled)
- `notes` (Text, nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships:**
- Belongs to Team
- Has many Videos
- Has many Notes
- Has many PlayerStats (for that game)

---

#### 6. Videos
Represents uploaded game footage or video clips.

**Attributes:**
- `id` (UUID, Primary Key)
- `game_id` (UUID, Foreign Key → Games)
- `uploaded_by` (UUID, Foreign Key → Users)
- `title` (String)
- `description` (Text, nullable)
- `file_url` (String) - S3 path
- `thumbnail_url` (String, nullable)
- `duration_seconds` (Integer, nullable)
- `file_size_bytes` (BigInt)
- `video_type` (Enum: full_game, period, clip, highlight)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships:**
- Belongs to Game
- Uploaded by User
- Has many VideoTags
- Referenced in many Notes

---

#### 7. VideoTags
Represents timestamps and tags on videos.

**Attributes:**
- `id` (UUID, Primary Key)
- `video_id` (UUID, Foreign Key → Videos)
- `created_by` (UUID, Foreign Key → Users)
- `timestamp_seconds` (Integer)
- `tag_type` (Enum: goal, penalty, faceoff, turnover, zone_entry, shot, save, other)
- `description` (String, nullable)
- `players_involved` (JSON array of player IDs)
- `created_at` (Timestamp)

**Relationships:**
- Belongs to Video
- Created by User
- References Players (via JSON array)

---

#### 8. Notes
Represents coaching observations, scouting reports, and general notes.

**Attributes:**
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → Teams)
- `author_id` (UUID, Foreign Key → Users)
- `title` (String)
- `content` (Text)
- `note_type` (Enum: game_review, practice_note, scouting_report, player_note, general)
- `related_game_id` (UUID, Foreign Key → Games, nullable)
- `related_video_id` (UUID, Foreign Key → Videos, nullable)
- `related_player_id` (UUID, Foreign Key → Players, nullable)
- `tags` (JSON array of strings)
- `pinned` (Boolean, default false)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships:**
- Belongs to Team
- Authored by User
- Optionally linked to Game
- Optionally linked to Video
- Optionally linked to Player

---

#### 9. Drills
Represents practice drills in the library.

**Attributes:**
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → Teams, nullable) - null means shared/template drill
- `created_by` (UUID, Foreign Key → Users)
- `name` (String)
- `description` (Text)
- `category` (Enum: skating, shooting, passing, defense, goalie, special_teams, conditioning)
- `duration_minutes` (Integer)
- `diagram_url` (String, nullable) - S3 path to diagram image
- `video_url` (String, nullable)
- `difficulty` (Enum: beginner, intermediate, advanced)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships:**
- Optionally belongs to Team (custom drills)
- Created by User
- Used in many PracticePlanDrills

---

#### 10. PracticePlans
Represents scheduled practice sessions.

**Attributes:**
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → Teams)
- `created_by` (UUID, Foreign Key → Users)
- `title` (String)
- `practice_date` (DateTime)
- `duration_minutes` (Integer)
- `location` (String, nullable)
- `focus_areas` (JSON array of strings)
- `notes` (Text, nullable)
- `status` (Enum: draft, scheduled, completed)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships:**
- Belongs to Team
- Created by User
- Has many PracticePlanDrills (ordered)

---

#### 11. PracticePlanDrills
Junction table linking drills to practice plans with ordering.

**Attributes:**
- `id` (UUID, Primary Key)
- `practice_plan_id` (UUID, Foreign Key → PracticePlans)
- `drill_id` (UUID, Foreign Key → Drills)
- `order_index` (Integer)
- `allocated_minutes` (Integer)
- `notes` (Text, nullable)

**Relationships:**
- Belongs to PracticePlan
- Belongs to Drill

---

#### 12. LineCombinations
Represents saved line configurations.

**Attributes:**
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → Teams)
- `created_by` (UUID, Foreign Key → Users)
- `name` (String, e.g., "Lines for March 15 vs Rivals")
- `configuration` (JSON) - structure below
- `is_active` (Boolean)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Configuration JSON Structure:**
```json
{
  "forward_lines": [
    {
      "line_number": 1,
      "left_wing": "player_id",
      "center": "player_id",
      "right_wing": "player_id"
    }
  ],
  "defensive_pairs": [
    {
      "pair_number": 1,
      "left_defense": "player_id",
      "right_defense": "player_id"
    }
  ],
  "goalies": {
    "starter": "player_id",
    "backup": "player_id"
  },
  "power_play": [
    {
      "unit": 1,
      "players": ["player_id", "player_id", "player_id", "player_id", "player_id"]
    }
  ],
  "penalty_kill": [
    {
      "unit": 1,
      "forwards": ["player_id", "player_id"],
      "defense": ["player_id", "player_id"]
    }
  ]
}
```

**Relationships:**
- Belongs to Team
- Created by User
- References Players (via JSON)

---

#### 13. PlayerStats
Represents performance statistics per game or season.

**Attributes:**
- `id` (UUID, Primary Key)
- `player_id` (UUID, Foreign Key → Players)
- `game_id` (UUID, Foreign Key → Games, nullable) - null for season totals
- `goals` (Integer, default 0)
- `assists` (Integer, default 0)
- `plus_minus` (Integer, default 0)
- `penalty_minutes` (Integer, default 0)
- `shots` (Integer, default 0)
- `ice_time_seconds` (Integer, nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships:**
- Belongs to Player
- Optionally belongs to Game

---

#### 14. Announcements
Represents team-wide announcements.

**Attributes:**
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → Teams)
- `author_id` (UUID, Foreign Key → Users)
- `title` (String)
- `message` (Text)
- `priority` (Enum: low, normal, high)
- `published_at` (Timestamp)
- `expires_at` (Timestamp, nullable)
- `created_at` (Timestamp)

**Relationships:**
- Belongs to Team
- Authored by User

---

### Entity Relationship Summary

```
Teams ─┬─→ Players (1:many)
       ├─→ Games (1:many)
       ├─→ TeamMembers (1:many)
       ├─→ PracticePlans (1:many)
       ├─→ Notes (1:many)
       ├─→ LineCombinations (1:many)
       └─→ Announcements (1:many)

Users ─┬─→ TeamMembers (1:many)
       ├─→ Players (1:1, optional)
       ├─→ Notes (1:many, as author)
       ├─→ Videos (1:many, as uploader)
       ├─→ PracticePlans (1:many, as creator)
       └─→ Drills (1:many, as creator)

Games ─┬─→ Videos (1:many)
       ├─→ Notes (1:many)
       └─→ PlayerStats (1:many)

Videos ─┬─→ VideoTags (1:many)
        └─→ Notes (1:many)

PracticePlans ─→ PracticePlanDrills ←─ Drills (many:many)

Players ─→ PlayerStats (1:many)
```

---

### Database Indexes

**Performance-Critical Indexes:**
- `users.email` (unique)
- `teams.id`
- `players.team_id`
- `games.team_id, game_date`
- `videos.game_id`
- `notes.team_id, created_at`
- `notes.author_id`
- `practice_plans.team_id, practice_date`
- `player_stats.player_id`
- `player_stats.game_id`

**Full-Text Search Indexes:**
- `notes.content` (PostgreSQL full-text search)
- `notes.title`
- `drills.name, description`

---


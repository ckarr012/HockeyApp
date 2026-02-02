# API Design - Hockey Coaching Application

## 5. API Design

### API Base Structure

**Base URL:** `https://api.hockeycoach.app/v1`

**Common Response Format:**
```json
{
  "success": true,
  "data": {...},
  "message": "Optional message",
  "timestamp": "2026-02-02T11:37:00Z"
}
```

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {...}
  },
  "timestamp": "2026-02-02T11:37:00Z"
}
```

---

### Authentication Endpoints

#### POST /auth/login
Login user and receive JWT token.

**Request:**
```json
{
  "email": "coach@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "coach@example.com",
      "first_name": "John",
      "last_name": "Smith",
      "role": "head_coach"
    }
  }
}
```

#### POST /auth/register
Register new user account.

#### POST /auth/logout
Invalidate current session.

#### POST /auth/refresh
Refresh JWT token.

---

### Team Management

#### GET /teams
List all teams for current user.

**Query Parameters:**
- `season` (optional) - Filter by season
- `page` (default: 1)
- `limit` (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "teams": [
      {
        "id": "uuid",
        "name": "Thunder U18 AAA",
        "season": "2025-2026",
        "division": "U18 AAA",
        "logo_url": "https://...",
        "member_count": 5,
        "player_count": 20,
        "created_at": "2025-09-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

#### POST /teams
Create a new team.

**Request:**
```json
{
  "name": "Thunder U18 AAA",
  "season": "2025-2026",
  "division": "U18 AAA"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "team": {
      "id": "uuid",
      "name": "Thunder U18 AAA",
      "season": "2025-2026",
      "division": "U18 AAA",
      "logo_url": null,
      "created_at": "2026-02-02T11:37:00Z"
    }
  }
}
```

#### GET /teams/:teamId
Get team details.

#### PATCH /teams/:teamId
Update team information.

#### DELETE /teams/:teamId
Delete team (head coach only).

---

### Roster Management

#### GET /teams/:teamId/players
Get team roster.

**Query Parameters:**
- `status` (optional) - Filter by status: active, inactive, injured
- `position` (optional) - Filter by position: C, LW, RW, D, G
- `sort` (default: jersey_number) - Sort by: jersey_number, last_name, position

**Response:**
```json
{
  "success": true,
  "data": {
    "players": [
      {
        "id": "uuid",
        "first_name": "Connor",
        "last_name": "Johnson",
        "jersey_number": 13,
        "position": "C",
        "shoots": "L",
        "height": "6'1\"",
        "weight": 185,
        "birth_date": "2008-03-15",
        "status": "active",
        "profile_photo_url": "https://...",
        "season_stats": {
          "games_played": 25,
          "goals": 18,
          "assists": 22,
          "points": 40,
          "plus_minus": 12
        }
      }
    ]
  }
}
```

#### POST /teams/:teamId/players
Add player to roster.

**Request:**
```json
{
  "first_name": "Connor",
  "last_name": "Johnson",
  "jersey_number": 13,
  "position": "C",
  "shoots": "L",
  "height": "6'1\"",
  "weight": 185,
  "birth_date": "2008-03-15"
}
```

#### GET /players/:playerId
Get player profile with stats.

#### PATCH /players/:playerId
Update player information.

#### DELETE /players/:playerId
Remove player from roster.

---

### Game Management

#### GET /teams/:teamId/games
List games for a team.

**Query Parameters:**
- `status` (optional) - Filter by: scheduled, completed, cancelled
- `start_date` (optional) - Filter games after this date
- `end_date` (optional) - Filter games before this date
- `home_away` (optional) - Filter by: home, away
- `sort` (default: game_date) - Sort by date

**Response:**
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "id": "uuid",
        "opponent_name": "Rival Rockets",
        "game_date": "2026-02-15T19:00:00Z",
        "location": "Community Arena",
        "home_away": "home",
        "score_team": 4,
        "score_opponent": 3,
        "status": "completed",
        "video_count": 2,
        "notes_count": 5
      }
    ]
  }
}
```

#### POST /teams/:teamId/games
Create a new game.

**Request:**
```json
{
  "opponent_name": "Rival Rockets",
  "game_date": "2026-02-15T19:00:00Z",
  "location": "Community Arena",
  "home_away": "home"
}
```

#### GET /games/:gameId
Get game details.

#### PATCH /games/:gameId
Update game (including scores).

**Request:**
```json
{
  "score_team": 4,
  "score_opponent": 3,
  "status": "completed",
  "notes": "Great comeback in third period"
}
```

#### DELETE /games/:gameId
Delete game.

---

### Video Management

#### GET /games/:gameId/videos
List videos for a game.

**Response:**
```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "id": "uuid",
        "title": "Full Game vs Rival Rockets",
        "description": "Complete game footage",
        "video_type": "full_game",
        "duration_seconds": 3600,
        "file_size_bytes": 2147483648,
        "thumbnail_url": "https://...",
        "uploaded_by": {
          "id": "uuid",
          "name": "John Smith"
        },
        "tag_count": 15,
        "created_at": "2026-02-15T21:30:00Z"
      }
    ]
  }
}
```

#### POST /games/:gameId/videos/upload-url
Request pre-signed URL for video upload.

**Request:**
```json
{
  "filename": "game-2026-02-15.mp4",
  "content_type": "video/mp4",
  "file_size": 2147483648
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "upload_url": "https://s3.amazonaws.com/...",
    "video_id": "uuid",
    "expires_in": 3600
  }
}
```

#### POST /videos/:videoId/complete
Notify API that upload is complete.

**Request:**
```json
{
  "title": "Full Game vs Rival Rockets",
  "description": "Complete game footage",
  "video_type": "full_game"
}
```

#### GET /videos/:videoId
Get video details and streaming URL.

**Response:**
```json
{
  "success": true,
  "data": {
    "video": {
      "id": "uuid",
      "title": "Full Game vs Rival Rockets",
      "description": "Complete game footage",
      "video_type": "full_game",
      "duration_seconds": 3600,
      "file_size_bytes": 2147483648,
      "thumbnail_url": "https://...",
      "stream_url": "https://cdn.../video.m3u8",
      "stream_expires_at": "2026-02-02T15:37:00Z",
      "tags": [
        {
          "id": "uuid",
          "timestamp_seconds": 120,
          "tag_type": "goal",
          "description": "Johnson scores on breakaway",
          "players_involved": ["uuid1", "uuid2"]
        }
      ]
    }
  }
}
```

#### DELETE /videos/:videoId
Delete video.

---

### Video Tagging

#### POST /videos/:videoId/tags
Add tag to video.

**Request:**
```json
{
  "timestamp_seconds": 120,
  "tag_type": "goal",
  "description": "Johnson scores on breakaway",
  "players_involved": ["player_uuid_1", "player_uuid_2"]
}
```

#### GET /videos/:videoId/tags
List all tags for video.

**Query Parameters:**
- `tag_type` (optional) - Filter by type
- `player_id` (optional) - Filter by player involvement

#### PATCH /tags/:tagId
Update tag.

#### DELETE /tags/:tagId
Delete tag.

---

### Notes & Observations

#### GET /teams/:teamId/notes
List notes for team.

**Query Parameters:**
- `note_type` (optional) - Filter by type
- `related_game_id` (optional)
- `related_player_id` (optional)
- `search` (optional) - Full-text search
- `pinned` (optional) - Filter pinned notes
- `sort` (default: created_at desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "uuid",
        "title": "Defensive Zone Coverage Issues",
        "content": "Need to work on...",
        "note_type": "game_review",
        "author": {
          "id": "uuid",
          "name": "John Smith"
        },
        "related_game": {
          "id": "uuid",
          "opponent_name": "Rival Rockets"
        },
        "tags": ["defense", "zone_coverage"],
        "pinned": true,
        "created_at": "2026-02-15T22:00:00Z"
      }
    ]
  }
}
```

#### POST /teams/:teamId/notes
Create a note.

**Request:**
```json
{
  "title": "Defensive Zone Coverage Issues",
  "content": "Need to work on...",
  "note_type": "game_review",
  "related_game_id": "uuid",
  "related_video_id": "uuid",
  "related_player_id": null,
  "tags": ["defense", "zone_coverage"],
  "pinned": false
}
```

#### GET /notes/:noteId
Get note details.

#### PATCH /notes/:noteId
Update note.

#### DELETE /notes/:noteId
Delete note.

---

### Practice Planning

#### GET /teams/:teamId/practice-plans
List practice plans.

**Query Parameters:**
- `status` (optional) - Filter by: draft, scheduled, completed
- `start_date` (optional)
- `end_date` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "practice_plans": [
      {
        "id": "uuid",
        "title": "Power Play Practice",
        "practice_date": "2026-02-10T17:00:00Z",
        "duration_minutes": 90,
        "location": "Main Arena",
        "focus_areas": ["power_play", "passing"],
        "drill_count": 8,
        "status": "scheduled",
        "created_by": {
          "id": "uuid",
          "name": "John Smith"
        }
      }
    ]
  }
}
```

#### POST /teams/:teamId/practice-plans
Create practice plan.

**Request:**
```json
{
  "title": "Power Play Practice",
  "practice_date": "2026-02-10T17:00:00Z",
  "duration_minutes": 90,
  "location": "Main Arena",
  "focus_areas": ["power_play", "passing"],
  "notes": "Focus on umbrella formation",
  "drills": [
    {
      "drill_id": "uuid",
      "order_index": 1,
      "allocated_minutes": 15,
      "notes": "Start with fundamentals"
    }
  ]
}
```

#### GET /practice-plans/:planId
Get practice plan details with drills.

#### PATCH /practice-plans/:planId
Update practice plan.

#### DELETE /practice-plans/:planId
Delete practice plan.

---

### Drill Library

#### GET /drills
List available drills (team + global).

**Query Parameters:**
- `category` (optional) - Filter by category
- `difficulty` (optional) - Filter by difficulty
- `search` (optional) - Search name/description
- `team_id` (optional) - Include team-specific drills

**Response:**
```json
{
  "success": true,
  "data": {
    "drills": [
      {
        "id": "uuid",
        "name": "3-on-2 Rush Drill",
        "description": "Offensive rush with defensive coverage",
        "category": "offense",
        "duration_minutes": 10,
        "difficulty": "intermediate",
        "diagram_url": "https://...",
        "video_url": "https://...",
        "is_custom": false
      }
    ]
  }
}
```

#### POST /teams/:teamId/drills
Create custom drill for team.

**Request:**
```json
{
  "name": "Custom Breakout Drill",
  "description": "Team-specific breakout pattern",
  "category": "offense",
  "duration_minutes": 12,
  "difficulty": "advanced"
}
```

#### GET /drills/:drillId
Get drill details.

#### PATCH /drills/:drillId
Update drill (custom drills only).

#### DELETE /drills/:drillId
Delete drill (custom drills only).

---

### Line Combinations

#### GET /teams/:teamId/line-combinations
List saved line combinations.

**Response:**
```json
{
  "success": true,
  "data": {
    "line_combinations": [
      {
        "id": "uuid",
        "name": "Lines for Feb 15 vs Rivals",
        "is_active": true,
        "created_by": {
          "id": "uuid",
          "name": "John Smith"
        },
        "configuration": {
          "forward_lines": [
            {
              "line_number": 1,
              "left_wing": "player_uuid",
              "center": "player_uuid",
              "right_wing": "player_uuid"
            }
          ],
          "defensive_pairs": [...],
          "goalies": {...},
          "power_play": [...],
          "penalty_kill": [...]
        },
        "created_at": "2026-02-14T10:00:00Z"
      }
    ]
  }
}
```

#### POST /teams/:teamId/line-combinations
Create line combination.

**Request:**
```json
{
  "name": "Lines for Feb 15 vs Rivals",
  "is_active": true,
  "configuration": {
    "forward_lines": [
      {
        "line_number": 1,
        "left_wing": "player_uuid",
        "center": "player_uuid",
        "right_wing": "player_uuid"
      }
    ],
    "defensive_pairs": [...],
    "goalies": {...}
  }
}
```

#### GET /line-combinations/:lineId
Get line combination details.

#### PATCH /line-combinations/:lineId
Update line combination.

#### DELETE /line-combinations/:lineId
Delete line combination.

---

### Player Statistics

#### GET /players/:playerId/stats
Get player statistics.

**Query Parameters:**
- `game_id` (optional) - Get stats for specific game
- `season` (optional) - Filter by season

**Response:**
```json
{
  "success": true,
  "data": {
    "season_totals": {
      "games_played": 25,
      "goals": 18,
      "assists": 22,
      "points": 40,
      "plus_minus": 12,
      "penalty_minutes": 16,
      "shots": 125,
      "average_ice_time_seconds": 900
    },
    "game_by_game": [
      {
        "game_id": "uuid",
        "game_date": "2026-02-15T19:00:00Z",
        "opponent": "Rival Rockets",
        "goals": 2,
        "assists": 1,
        "plus_minus": 2,
        "penalty_minutes": 0,
        "shots": 5,
        "ice_time_seconds": 960
      }
    ]
  }
}
```

#### POST /players/:playerId/stats
Add game stats for player.

**Request:**
```json
{
  "game_id": "uuid",
  "goals": 2,
  "assists": 1,
  "plus_minus": 2,
  "penalty_minutes": 0,
  "shots": 5,
  "ice_time_seconds": 960
}
```

#### PATCH /stats/:statId
Update player game stats.

---

### Announcements

#### GET /teams/:teamId/announcements
List team announcements.

**Query Parameters:**
- `priority` (optional) - Filter by priority
- `active_only` (default: true) - Only show non-expired

**Response:**
```json
{
  "success": true,
  "data": {
    "announcements": [
      {
        "id": "uuid",
        "title": "Practice Cancelled Tomorrow",
        "message": "Due to arena maintenance...",
        "priority": "high",
        "author": {
          "id": "uuid",
          "name": "John Smith"
        },
        "published_at": "2026-02-10T08:00:00Z",
        "expires_at": "2026-02-11T23:59:59Z"
      }
    ]
  }
}
```

#### POST /teams/:teamId/announcements
Create announcement.

**Request:**
```json
{
  "title": "Practice Cancelled Tomorrow",
  "message": "Due to arena maintenance...",
  "priority": "high",
  "expires_at": "2026-02-11T23:59:59Z"
}
```

#### DELETE /announcements/:announcementId
Delete announcement.

---

### Team Members (Staff)

#### GET /teams/:teamId/members
List team staff members.

**Response:**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "email": "assistant@example.com",
          "first_name": "Mike",
          "last_name": "Johnson"
        },
        "role": "assistant_coach",
        "joined_at": "2025-09-01T00:00:00Z"
      }
    ]
  }
}
```

#### POST /teams/:teamId/members
Invite staff member to team.

**Request:**
```json
{
  "email": "assistant@example.com",
  "role": "assistant_coach"
}
```

#### PATCH /team-members/:memberId
Update member role.

#### DELETE /team-members/:memberId
Remove member from team.

---

### HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **204 No Content** - Request successful, no data to return
- **400 Bad Request** - Invalid request format or parameters
- **401 Unauthorized** - Authentication required or failed
- **403 Forbidden** - User lacks permission
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource conflict (e.g., duplicate email)
- **422 Unprocessable Entity** - Validation errors
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error

---

### Rate Limiting

- **General API calls:** 1000 requests/hour per user
- **Video upload URLs:** 100 requests/hour per user
- **Search endpoints:** 200 requests/hour per user

Rate limit headers included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1643989200
```

---

### Pagination

All list endpoints support pagination:

**Request Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

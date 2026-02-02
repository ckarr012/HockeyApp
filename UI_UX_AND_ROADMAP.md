# UI/UX Design & Technical Roadmap - Hockey Coaching Application

## 6. UI/UX & User Flows

### Design Principles

**1. Coach-First Design**
- Optimize for desktop/laptop (primary work environment)
- Quick access to frequently used features
- Minimize clicks to complete common tasks
- Support keyboard shortcuts for power users

**2. Visual Clarity**
- Clean, uncluttered interfaces
- Clear visual hierarchy
- Consistent color scheme and typography
- Ample whitespace for readability

**3. Performance**
- Fast page loads (< 2 seconds)
- Smooth video playback
- Instant feedback on user actions
- Optimistic UI updates

**4. Progressive Disclosure**
- Show essential information first
- Reveal advanced features as needed
- Collapsible sections for detailed data
- Context-sensitive help

---

### Main Dashboard Layout

#### Dashboard Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] Hockey Coach App    [Team Selector ▼]    [User Menu ⚙]     │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────┬──────────────────────────────────────────────────────┐ │
│ │         │                                                        │ │
│ │  MENU   │              MAIN CONTENT AREA                        │ │
│ │         │                                                        │ │
│ │ 🏠 Home │                                                        │ │
│ │ 🎥 Video│                                                        │ │
│ │ 👥 Team │                                                        │ │
│ │ 📅 Games│                                                        │ │
│ │ 📝 Notes│                                                        │ │
│ │ 🏒 Practice                                                      │ │
│ │ 📊 Stats│                                                        │ │
│ │         │                                                        │ │
│ └─────────┴──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

#### Navigation Menu Items

**🏠 Home (Dashboard)**
- Quick stats overview
- Upcoming games
- Recent videos
- Pinned notes
- Practice schedule widget

**🎥 Video Library**
- All game footage
- Video player
- Tagging interface
- Clip creation

**👥 Team**
- Roster management
- Player profiles
- Line combinations
- Staff management

**📅 Games**
- Game schedule (calendar view)
- Game details
- Add/edit games
- Link to footage

**📝 Notes**
- All coaching notes
- Search and filter
- Create new notes
- Pinned notes

**🏒 Practice**
- Practice planner
- Drill library
- Upcoming practices
- Practice templates

**📊 Stats**
- Team statistics
- Player performance
- Trends and analytics
- Season summaries

---

### Key Screens

#### 1. Dashboard (Home Screen)

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│ Welcome back, Coach Smith                    🔔 Notifications│
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ ┏━━━━━━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ UPCOMING GAMES    ┃  ┃ RECENT VIDEOS                    ┃ │
│ ┃                   ┃  ┃                                  ┃ │
│ ┃ Feb 15 - Rockets  ┃  ┃ [Thumbnail] Full Game vs Bears  ┃ │
│ ┃ Feb 18 - Eagles   ┃  ┃ [Thumbnail] Practice - Feb 10   ┃ │
│ ┃ Feb 22 - Hawks    ┃  ┃                                  ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                                │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ QUICK STATS                                              ┃ │
│ ┃                                                          ┃ │
│ ┃  25 Games Played  │  67% Win Rate  │  3.8 Goals/Game   ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                                │
│ ┏━━━━━━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ PINNED NOTES      ┃  ┃ PRACTICE SCHEDULE                ┃ │
│ ┃                   ┃  ┃                                  ┃ │
│ ┃ 📌 Defensive...   ┃  ┃ Tomorrow - 5:00 PM              ┃ │
│ ┃ 📌 Special teams  ┃  ┃ Feb 12 - 5:00 PM                ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└──────────────────────────────────────────────────────────────┘
```

**Widgets:**
- **Upcoming Games** - Next 3-5 games with date, opponent, location
- **Recent Videos** - Latest uploaded footage with thumbnails
- **Quick Stats** - Season overview (games, win %, goals/game)
- **Pinned Notes** - Important coaching notes
- **Practice Schedule** - Upcoming practices
- **Announcements** - Team announcements (if any)

---

#### 2. Video Library & Player

**List View:**
```
┌──────────────────────────────────────────────────────────────┐
│ Video Library                              [+ Upload Video]   │
├──────────────────────────────────────────────────────────────┤
│ Filters: [All Games ▼] [Full Game ▼] [Date Range]  🔍Search │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ ┌──────────┐  Full Game vs Rival Rockets                     │
│ │ [THUMB] │  Feb 15, 2026 • 60:00 • 15 tags                 │
│ │  ▶️      │  Final Score: 4-3                                │
│ └──────────┘  [View] [Tag] [Download]                        │
│                                                                │
│ ┌──────────┐  Full Game vs Thunder Bears                     │
│ │ [THUMB] │  Feb 8, 2026 • 58:30 • 12 tags                  │
│ │  ▶️      │  Final Score: 2-2 (OT)                           │
│ └──────────┘  [View] [Tag] [Download]                        │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

**Player View:**
```
┌──────────────────────────────────────────────────────────────┐
│ ← Back to Library                                            │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │                                                            │ │
│ │                   VIDEO PLAYER                             │ │
│ │                                                            │ │
│ │  [                                                    ]    │ │
│ │  ◼ ▶️ ⏸ ⏭  ────●────────────────  🔊 ⚙️  [0.5x] [⛶]   │ │
│ │       00:15:32 / 01:00:00                                  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ Full Game vs Rival Rockets • Feb 15, 2026                    │
│                                                                │
│ ┌─────────────────┬──────────────────────────────────────┐   │
│ │ TAGS (15)       │ NOTES (3)         INFO              │   │
│ ├─────────────────┼──────────────────────────────────────┤   │
│ │ 🥅 00:05:12     │                                      │   │
│ │ Goal - Johnson  │ Linked notes and metadata appear    │   │
│ │                 │ in these tabs                        │   │
│ │ ⚠️  00:12:45    │                                      │   │
│ │ Penalty - Smith │                                      │   │
│ │                 │                                      │   │
│ │ 🥅 00:18:33     │                                      │   │
│ │ Goal - Williams │                                      │   │
│ │                 │                                      │   │
│ │ [+ Add Tag]     │                                      │   │
│ └─────────────────┴──────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

**Video Player Features:**
- Standard playback controls
- Speed adjustment (0.25x to 2x)
- Frame-by-frame stepping
- Timestamp markers for tags
- Click tag to jump to timestamp
- Add tag at current time
- Fullscreen mode
- Picture-in-picture support

---

#### 3. Player Profile

```
┌──────────────────────────────────────────────────────────────┐
│ ← Back to Roster                                    [Edit]   │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ ┌────────┐                                                    │
│ │ PHOTO  │  #13 Connor Johnson                               │
│ │        │  Center • Shoots: Left                            │
│ │        │  6'1" • 185 lbs • Age: 17                         │
│ └────────┘  Status: Active                                   │
│                                                                │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ SEASON STATS (2025-2026)                                │  │
│ ├─────────────────────────────────────────────────────────┤  │
│ │ GP: 25  G: 18  A: 22  PTS: 40  +/-: +12  PIM: 16      │  │
│ │ Shots: 125  Avg TOI: 15:00                            │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                                │
│ ┌────────────────────┬──────────────────────────────────┐    │
│ │ GAME LOG          │ NOTES & OBSERVATIONS             │    │
│ ├────────────────────┼──────────────────────────────────┤    │
│ │ Feb 15 vs Rockets │                                  │    │
│ │ 2G, 1A, +2        │ Strong positioning in D-zone     │    │
│ │                   │                                  │    │
│ │ Feb 8 vs Bears    │ Needs work on faceoffs           │    │
│ │ 0G, 2A, +1        │                                  │    │
│ │                   │ Great playmaking ability         │    │
│ │ Feb 1 vs Eagles   │                                  │    │
│ │ 1G, 0A, -1        │                                  │    │
│ └────────────────────┴──────────────────────────────────┘    │
│                                                                │
│ [View Game Videos] [View All Notes] [Performance Trends]     │
└──────────────────────────────────────────────────────────────┘
```

---

#### 4. Practice Planner

**Practice List:**
```
┌──────────────────────────────────────────────────────────────┐
│ Practice Plans                           [+ Create Practice]  │
├──────────────────────────────────────────────────────────────┤
│ Filters: [All Status ▼] [This Month ▼]           🔍Search   │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ ⏰ Tomorrow • 5:00 PM • Main Arena                           │
│   Power Play Practice                                         │
│   90 min • 8 drills • Focus: Special Teams                   │
│   [View] [Edit] [Print]                                      │
│                                                                │
│ ⏰ Feb 12 • 5:00 PM • Main Arena                             │
│   Defensive Zone Coverage                                     │
│   90 min • 6 drills • Focus: Defense                         │
│   [View] [Edit] [Print]                                      │
│                                                                │
│ ✓ Feb 10 • 5:00 PM • Completed                               │
│   Breakout Drills                                             │
│   90 min • 7 drills                                          │
│   [View]                                                      │
└──────────────────────────────────────────────────────────────┘
```

**Practice Builder:**
```
┌──────────────────────────────────────────────────────────────┐
│ New Practice Plan                    [Save Draft] [Publish]  │
├──────────────────────────────────────────────────────────────┤
│ Title: [Power Play Practice                              ]   │
│ Date/Time: [Feb 15, 2026] [5:00 PM]  Duration: [90] min     │
│ Location: [Main Arena                                    ]   │
│ Focus Areas: [✓ Power Play] [✓ Passing] [ ] Defense         │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ PRACTICE SCHEDULE                      DRILL LIBRARY          │
│ ┌─────────────────────────┐  ⟷  ┌──────────────────────┐   │
│ │ 1. Warmup (10 min)      │      │ 🔍 Search drills...  │   │
│ │    Standard Skating     │      ├──────────────────────┤   │
│ │    [Edit] [Remove]      │      │ Category: [All ▼]   │   │
│ │                         │      │ Difficulty: [All ▼] │   │
│ │ 2. PP Formation (15 min)│      ├──────────────────────┤   │
│ │    Umbrella Setup       │      │ [DRAG] 2-on-1 Drill │   │
│ │    [Edit] [Remove]      │      │ Offense • 10 min    │   │
│ │                         │      │                      │   │
│ │ 3. Shooting (20 min)    │      │ [DRAG] Cycle Drill  │   │
│ │    One-timer Practice   │      │ Offense • 12 min    │   │
│ │    [Edit] [Remove]      │      │                      │   │
│ │                         │      │ [DRAG] Breakout     │   │
│ │ [+ Add Drill]           │      │ Transition • 15 min │   │
│ │                         │      │                      │   │
│ │ Total: 45 / 90 min      │      │ [+ Create Custom]   │   │
│ └─────────────────────────┘      └──────────────────────┘   │
│                                                                │
│ Notes:                                                         │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Focus on umbrella formation. Make sure D-men are active  │ │
│ │ in the rotation. Emphasize quick puck movement.          │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Drag-and-drop drill organization
- Real-time duration calculation
- Drill library browser
- Save as template for reuse
- Print-friendly view
- Share with assistant coaches

---

#### 5. Line Combination Builder

```
┌──────────────────────────────────────────────────────────────┐
│ Line Combinations                        [+ New Combination]  │
├──────────────────────────────────────────────────────────────┤
│ Active Lines: Lines for Feb 15 vs Rivals        [Save] [⋮]   │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ FORWARD LINES                                                  │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Line 1:  [LW: #14 Smith] - [C: #13 Johnson] - [RW: #7...]│ │
│ │ Line 2:  [LW: #23 Brown] - [C: #19 Davis  ] - [RW: #8...]│ │
│ │ Line 3:  [LW: #17 White] - [C: #21 Miller ] - [RW: #5...]│ │
│ │ Line 4:  [LW: #25 Green] - [C: #28 Wilson ] - [RW: #9...]│ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ DEFENSIVE PAIRS                                                │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Pair 1:  [LD: #4 Anderson] - [RD: #6 Taylor]             │ │
│ │ Pair 2:  [LD: #22 Clark  ] - [RD: #3 Moore ]             │ │
│ │ Pair 3:  [LD: #18 Lewis  ] - [RD: #2 Young ]             │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ GOALIES                                                        │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Starter: [#30 Jackson]    Backup: [#31 Thompson]         │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                                │
│ ┌─────────────────────┬──────────────────────────────────┐   │
│ │ POWER PLAY UNITS    │ PENALTY KILL UNITS               │   │
│ ├─────────────────────┼──────────────────────────────────┤   │
│ │ PP1: 5 players      │ PK1: 4 players                   │   │
│ │ PP2: 5 players      │ PK2: 4 players                   │   │
│ └─────────────────────┴──────────────────────────────────┘   │
│                                                                │
│ [Export Line Sheet PDF] [Set as Active] [Duplicate]          │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Drag-and-drop player assignment
- Visual representation of ice positions
- Save multiple combinations
- Mark one as "active"
- Export to PDF for printing
- Quick player swap
- View player stats while building

---

#### 6. Game Schedule (Calendar View)

```
┌──────────────────────────────────────────────────────────────┐
│ Game Schedule                                  [+ Add Game]   │
├──────────────────────────────────────────────────────────────┤
│ [< Prev]        February 2026             [Next >]  [List ▼] │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Sun    Mon    Tue    Wed    Thu    Fri    Sat               │
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐                 │
│ │  1  │  2  │  3  │  4  │  5  │  6  │  7  │                 │
│ │     │     │     │     │     │     │7pm  │                 │
│ │     │     │     │     │     │     │vsEag│                 │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                 │
│ │  8  │  9  │ 10  │ 11  │ 12  │ 13  │ 14  │                 │
│ │7pm  │     │⚙️   │     │⚙️   │     │     │                 │
│ │vsBea│     │Prac │     │Prac │     │     │                 │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                 │
│ │ 15  │ 16  │ 17  │ 18  │ 19  │ 20  │ 21  │                 │
│ │7pm  │     │     │6pm  │     │     │7pm  │                 │
│ │vsRoc│     │     │vsHaw│     │     │vsWol│                 │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                 │
│ │ 22  │ 23  │ 24  │ 25  │ 26  │ 27  │ 28  │                 │
│ │     │     │     │     │⚙️   │     │7pm  │                 │
│ │     │     │     │     │Prac │     │vsPan│                 │
│ └─────┴─────┴─────┴─────┴─────┴─────┴─────┘                 │
│                                                                │
│ Legend: 🏠 Home  🚌 Away  ⚙️ Practice                         │
└──────────────────────────────────────────────────────────────┘
```

---

### User Flows

#### Flow 1: Coach Reviews Game and Builds Practice Plan

1. **Upload Game Footage**
   - Navigate to Video Library
   - Click "Upload Video"
   - Select game from schedule
   - Upload file (direct to S3)
   - System generates thumbnail

2. **Review and Tag Video**
   - Open video player
   - Watch game footage
   - Pause at key moments
   - Add tags (goals, penalties, turnovers)
   - Tag players involved
   - Note timestamp

3. **Create Coaching Notes**
   - Click "Add Note" from video player
   - Select note type (game review)
   - Write observations
   - Link to video timestamps
   - Tag areas (defense, special teams)
   - Save note

4. **Build Practice Plan**
   - Navigate to Practice Planner
   - Click "Create Practice"
   - Set date, time, location
   - Add focus areas based on notes
   - Browse drill library
   - Drag drills into schedule
   - Adjust timing
   - Add practice notes referencing game issues
   - Save and publish

5. **Share with Staff**
   - Practice plan automatically visible to all coaches
   - Send notification to team
   - Export PDF for printing

**Time to Complete:** ~20-30 minutes (excluding video watching)

---

#### Flow 2: Assistant Coach Prepares Scouting Report

1. **Create Game Entry**
   - Navigate to Games
   - Add upcoming opponent game
   - Enter opponent name, date, location

2. **Upload Opponent Footage** (if available)
   - Upload opponent game video
   - Link to game entry

3. **Create Scouting Notes**
   - Navigate to Notes
   - Create new note (type: scouting report)
   - Link to opponent game
   - Document:
     - Opponent strengths/weaknesses
     - Key players to watch
     - Common systems (power play, breakout)
     - Tendencies (zone entries, defensive structure)
   - Tag video timestamps showing patterns

4. **Share with Head Coach**
   - Pin note for visibility
   - Mention in team announcements
   - Head coach reviews and adds comments

**Time to Complete:** ~45-60 minutes

---

#### Flow 3: Setting Line Combinations for Next Game

1. **Review Player Stats**
   - Navigate to Team → Roster
   - Review recent performance
   - Check player status (injuries)

2. **Open Line Builder**
   - Navigate to Team → Line Combinations
   - Click "New Combination"
   - Name it (e.g., "Lines for Feb 15 vs Rivals")

3. **Build Lines**
   - Drag players into forward line slots
   - Create 4 forward lines
   - Assign defensive pairs
   - Set starting goalie
   - Build power play units
   - Build penalty kill units

4. **Review and Adjust**
   - Check player chemistry
   - Consider opponent matchups
   - Make adjustments

5. **Finalize**
   - Save combination
   - Set as "active"
   - Export line sheet PDF
   - Print for bench staff

**Time to Complete:** ~10-15 minutes

---

#### Flow 4: Player Views Personal Assignments

1. **Login to App**
   - Player logs in with credentials
   - Redirected to player dashboard

2. **Check Schedule**
   - View upcoming games and practices
   - See next practice date/time

3. **View Assigned Video Clips**
   - Navigate to "My Videos"
   - See clips tagged with player's name
   - Watch specific plays
   - Read coach comments

4. **Review Personal Stats**
   - View season statistics
   - See game-by-game performance
   - Review trends

5. **Read Announcements**
   - Check team announcements
   - Acknowledge important messages

**Time to Complete:** ~5-10 minutes

---

### Responsive Design Considerations

**Desktop (Primary):** 1920x1080 and above
- Full feature access
- Side-by-side panels
- Drag-and-drop interfaces
- Video player with full controls

**Tablet (iPad):** 1024x768
- Optimized navigation
- Stacked panels
- Touch-friendly controls
- Video playback supported

**Mobile (Limited):** 375x667 and above
- View-only mode primarily
- Schedule viewing
- Video playback
- Announcements
- Limited editing capabilities

---

### Accessibility Features

- **Keyboard Navigation:** Full keyboard support for all features
- **Screen Reader Support:** ARIA labels on all interactive elements
- **Color Contrast:** WCAG AA compliance
- **Font Sizing:** Adjustable text sizes
- **Video Captions:** Support for subtitle files (future)

---

### Performance Targets

- **Page Load:** < 2 seconds (initial)
- **Time to Interactive:** < 3 seconds
- **Video Start:** < 1 second (after buffer)
- **Search Results:** < 500ms
- **API Response:** < 200ms (p95)

---

## 7. Technical Roadmap

### Development Phases

---

## Phase 1: Core Coaching Workflow (MVP)
**Duration:** 12-16 weeks  
**Goal:** Launch functional coaching app with essential features

### Week 1-2: Project Setup & Infrastructure
- Set up development environment
- Initialize Git repository
- Create project structure (frontend + backend)
- Set up PostgreSQL database
- Configure S3 or compatible storage
- Set up CI/CD pipeline
- Create development, staging, production environments

**Deliverables:**
- ✅ Repository structure
- ✅ Database schema (initial migration)
- ✅ API server boilerplate
- ✅ React app scaffolding
- ✅ Deployment pipeline

---

### Week 3-5: Authentication & Team Management
- Implement user registration/login
- JWT-based authentication
- Team creation and management
- User role system (head coach, assistant, etc.)
- Team member invitations
- Basic user profile

**Deliverables:**
- ✅ Auth API endpoints
- ✅ Login/register UI
- ✅ Team creation flow
- ✅ Role-based access control
- ✅ Team switcher component

---

### Week 6-8: Roster & Player Management
- Player CRUD operations
- Roster list view
- Player profile page
- Player status management
- Jersey number validation
- Basic search and filtering

**Deliverables:**
- ✅ Player API endpoints
- ✅ Roster list UI
- ✅ Player profile UI
- ✅ Add/edit player forms
- ✅ Player search

---

### Week 9-11: Game Management & Video Upload
- Game scheduling (CRUD)
- Calendar view
- Video upload flow (pre-signed URLs)
- Video metadata storage
- Thumbnail generation
- Video library list view
- Basic video player integration

**Deliverables:**
- ✅ Game API endpoints
- ✅ Calendar UI component
- ✅ Video upload UI
- ✅ S3 integration
- ✅ Video library UI
- ✅ Video player (Video.js integration)

---

### Week 12-13: Video Tagging & Notes
- Video tagging system
- Tag timeline markers
- Basic note creation
- Note linking (games, videos, players)
- Note search
- Pinned notes

**Deliverables:**
- ✅ Video tag API
- ✅ Tag UI in video player
- ✅ Notes API endpoints
- ✅ Notes list UI
- ✅ Note editor (rich text)
- ✅ Note search

---

### Week 14-15: Practice Planning
- Drill library (basic)
- Practice plan creation
- Drill ordering
- Practice list view
- Print-friendly practice plan

**Deliverables:**
- ✅ Drill API endpoints
- ✅ Practice plan API
- ✅ Drill library UI
- ✅ Practice builder UI (drag-drop)
- ✅ Print view

---

### Week 16: MVP Polish & Launch Prep
- Bug fixes
- UI/UX refinements
- Performance optimization
- Documentation
- User testing
- Deployment preparation

**Deliverables:**
- ✅ Beta release
- ✅ User documentation
- ✅ Bug fixes
- ✅ Performance improvements

---

## Phase 2: Analytics & Performance Views
**Duration:** 8-10 weeks  
**Goal:** Add statistics, analytics, and enhanced video features

### Week 17-18: Player Statistics
- Player stat entry
- Game-by-game stats
- Season totals calculation
- Stats dashboard
- Performance trends (basic charts)

**Deliverables:**
- ✅ Player stats API
- ✅ Stats entry form
- ✅ Player stats dashboard
- ✅ Charts integration (Chart.js)

---

### Week 19-20: Advanced Video Features
- Video playback speed control
- Frame-by-frame navigation
- Video clipping/segment creation
- Tag filtering
- Highlight reel creation
- Side-by-side video comparison

**Deliverables:**
- ✅ Enhanced video player controls
- ✅ Clip creation UI
- ✅ Video segment storage
- ✅ Filter UI for tags
- ✅ Comparison view

---

### Week 21-22: Line Combination Builder
- Line combination data model
- Drag-and-drop line builder
- Multiple combinations per team
- Active/inactive combinations
- Export to PDF
- Special teams configuration

**Deliverables:**
- ✅ Line combination API
- ✅ Line builder UI
- ✅ PDF export functionality
- ✅ Special teams builder

---

### Week 23-24: Scouting Reports & Templates
- Scouting report templates
- Opponent tracking
- Report builder
- Link to opponent footage
- Shareable reports

**Deliverables:**
- ✅ Scouting report schema
- ✅ Report template system
- ✅ Report builder UI
- ✅ Report sharing

---

### Week 25-26: Phase 2 Polish
- Feature refinements
- Additional analytics
- Performance optimization
- User feedback incorporation

---

## Phase 3: Team Communication & Collaboration
**Duration:** 6-8 weeks  
**Goal:** Enable team-wide communication and enhanced collaboration

### Week 27-28: Announcements & Notifications
- Announcement system
- In-app notifications
- Email notifications (optional)
- Read receipts
- Priority levels
- Expiring announcements

**Deliverables:**
- ✅ Announcement API
- ✅ Notification system
- ✅ Announcement UI
- ✅ Email integration

---

### Week 29-30: Resource Sharing & Comments
- Share video clips with staff
- Share practice plans
- Comment system on shared items
- Permissions for viewing

**Deliverables:**
- ✅ Sharing API
- ✅ Comments API
- ✅ Sharing UI
- ✅ Comment threads

---

### Week 31-32: Enhanced Collaboration
- Real-time updates (WebSocket)
- Collaborative note editing
- Activity feed
- User mentions

**Deliverables:**
- ✅ WebSocket integration
- ✅ Real-time sync
- ✅ Activity feed UI
- ✅ Mention system

---

### Week 33-34: Phase 3 Polish & Launch
- Integration testing
- Security audit
- Performance tuning
- User acceptance testing
- Production release

---

## Future Phases (Post-Launch)

### Phase 4: Mobile Applications
- Native iOS app
- Native Android app
- Offline video viewing
- Mobile-optimized workflows

### Phase 5: Advanced Analytics
- Shot charts
- Heat maps
- Zone tracking
- Advanced metrics
- AI-powered insights

### Phase 6: Integrations
- League management systems
- Calendar sync (Google, Outlook)
- Video editing software export
- Wearable device integration

---

## Code Structure & Best Practices

### Frontend Structure
```
/src
  /components
    /common         # Reusable UI components
    /video          # Video player, tags, etc.
    /team           # Roster, players, lines
    /practice       # Practice planner components
    /games          # Schedule, game details
  /pages            # Route-level components
  /hooks            # Custom React hooks
  /services         # API client services
  /store            # State management (Zustand/Redux)
  /utils            # Helper functions
  /types            # TypeScript types
  /styles           # Global styles (Tailwind config)
```

### Backend Structure
```
/src
  /routes           # Express route definitions
  /controllers      # Business logic
  /models           # Database models (Prisma/TypeORM)
  /middleware       # Auth, validation, error handling
  /services         # External services (S3, email)
  /utils            # Helper functions
  /validators       # Request validation schemas
  /config           # Configuration files
  /migrations       # Database migrations
```

---

## Coding Standards

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Explicit return types on functions
- Interface over type where possible

### React
- Functional components only
- Custom hooks for reusable logic
- Proper memo usage for performance
- Descriptive component names

### API
- RESTful design principles
- Consistent naming conventions
- Proper HTTP status codes
- Comprehensive error messages

### Database
- Migration-based schema changes
- Indexed foreign keys
- Cascade deletes where appropriate
- Regular backups

### Testing
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Minimum 70% code coverage

---

## Security Considerations (Non-Auth)

### Input Validation
- Validate all user inputs
- Sanitize data before storage
- Use parameterized queries
- Rate limiting on all endpoints

### File Upload
- File type validation
- File size limits (2GB for video)
- Virus scanning (future)
- Pre-signed URLs with expiration

### Data Privacy
- User data isolation by team
- Audit logging for sensitive operations
- GDPR-compliant data export/deletion

---

## Monitoring & Maintenance

### Application Monitoring
- Error tracking (Sentry, Rollbar)
- Performance monitoring (APM)
- User analytics (privacy-focused)
- Uptime monitoring

### Database Maintenance
- Regular backups (daily)
- Query performance monitoring
- Index optimization
- Data archival strategy

### Infrastructure
- CDN for media delivery
- Database read replicas (scaling)
- Load balancing (when needed)
- Auto-scaling groups

---

## Success Metrics

### User Engagement
- Daily active users
- Session duration
- Features used per session
- Video uploads per week

### Performance
- Page load times
- API response times
- Video streaming quality
- Error rates

### Business Goals
- User retention rate
- Feature adoption rate
- User satisfaction (NPS)
- Support ticket volume

---

## Conclusion

This technical roadmap provides a structured approach to building a full-featured hockey coaching application over approximately 34 weeks (8-9 months) for the core product, with additional phases planned for mobile apps, advanced analytics, and integrations.

The phased approach ensures:
- ✅ **MVP delivered in 16 weeks** with core workflow
- ✅ **Iterative improvements** based on user feedback
- ✅ **Scalable architecture** for future growth
- ✅ **Clean, maintainable codebase** with modern technologies
- ✅ **Focus on coach productivity** and user experience

Each phase builds on previous work, allowing for early user testing and feedback incorporation, ensuring the final product meets real-world coaching needs.

# Ice Hockey Coaching Application - Complete Design Package

> A comprehensive, production-ready design for a full-stack web application built for ice hockey coaches and team staff.

---

## 📋 Overview

This repository contains a complete product design for a professional ice hockey coaching application. The design covers all aspects from product requirements to technical implementation, focusing on real-world coaching workflows without security/encryption concerns at this stage.

**Design Status:** Complete  
**Target Users:** Hockey coaches, assistant coaches, trainers, video analysts  
**Platform:** Web application (desktop-first, tablet-optimized)  
**Timeline:** 34 weeks for core product (MVP + 2 enhancement phases)

---

## 📚 Documentation Structure

This design package consists of three comprehensive documents:

### 1️⃣ [HOCKEY_COACHING_APP_DESIGN.md](./HOCKEY_COACHING_APP_DESIGN.md)
**Main Product Design Document**

Contains:
- ✅ **Feature Discovery** - MVP, Phase 2, and future features organized by priority
- ✅ **User Roles & Use Cases** - Detailed roles for coaches, staff, and players with workflows
- ✅ **System Architecture** - Frontend, backend, database, and media storage design
- ✅ **Data Models & Database Schema** - 14 core entities with relationships and indexes

**Read this first** to understand the product vision, user needs, and technical foundation.

---

### 2️⃣ [API_DESIGN.md](./API_DESIGN.md)
**Complete REST API Specification**

Contains:
- ✅ **Authentication Endpoints** - Login, registration, token management
- ✅ **Team Management** - Teams, rosters, staff members
- ✅ **Game Management** - Schedule, scores, game details
- ✅ **Video Management** - Upload, streaming, tagging
- ✅ **Notes System** - Coaching observations, scouting reports
- ✅ **Practice Planning** - Plans, drills, drill library
- ✅ **Line Combinations** - Forward lines, D-pairs, special teams
- ✅ **Player Statistics** - Game stats, season totals
- ✅ **Announcements** - Team communications

**70+ API endpoints** with complete request/response examples, query parameters, and error handling.

---

### 3️⃣ [UI_UX_AND_ROADMAP.md](./UI_UX_AND_ROADMAP.md)
**User Experience & Technical Roadmap**

Contains:
- ✅ **UI/UX Design** - Dashboard layouts, key screens, navigation
- ✅ **User Flows** - Step-by-step workflows for common coaching tasks
- ✅ **Screen Mockups** - Text-based wireframes for all major screens
- ✅ **Technical Roadmap** - 34-week development plan broken into phases
- ✅ **Code Structure** - Recommended file organization and best practices
- ✅ **Success Metrics** - KPIs for engagement and performance

**Complete implementation guide** from wireframes to production deployment.

---

## 🎯 Key Features

### Core Coaching Workflow (MVP)
- 🎥 **Game footage upload and organization** with S3 storage
- 📹 **Video player with timestamp tagging** for play analysis
- 📝 **Coaching notes and scouting reports** linked to games/videos/players
- 👥 **Player profiles and roster management** with stats
- 🏒 **Practice planning with drill library** and drag-drop builder
- 📅 **Game schedule and calendar** with home/away tracking
- ⚡ **Line combinations builder** for all situations (5v5, PP, PK)

### Phase 2 Enhancements
- 📊 **Performance tracking and statistics** with trends
- 🎬 **Advanced video features** (clipping, slow-mo, side-by-side)
- 🔍 **Enhanced tagging system** with filters and highlight reels
- 📋 **Scouting report templates** for opponent analysis

### Phase 3 Features
- 📢 **Team announcements and notifications**
- 🤝 **Resource sharing** between coaches
- 💬 **Collaborative features** with real-time updates

---

## 🏗️ Technology Stack

### Frontend
- **Framework:** React 18+ with TypeScript
- **Styling:** TailwindCSS + shadcn/ui components
- **State Management:** Zustand or Redux
- **Video Player:** Video.js or Plyr
- **API Client:** Axios with React Query
- **Routing:** React Router

### Backend
- **Runtime:** Node.js (LTS)
- **Framework:** Express.js with TypeScript
- **Database ORM:** Prisma or TypeORM
- **File Upload:** Multer
- **Validation:** Express Validator

### Database & Storage
- **Primary Database:** PostgreSQL (ACID compliance, JSON support)
- **Media Storage:** AWS S3 (or MinIO/Cloudflare R2)
- **File Types:** Videos (MP4/MOV), images, PDFs

### Infrastructure
- **Deployment:** Docker containers
- **CDN:** CloudFront or similar for video delivery
- **Monitoring:** Application performance monitoring

---

## 👥 User Roles

| Role | Permissions | Primary Use Cases |
|------|-------------|-------------------|
| **Head Coach** | Full access | Video review, practice planning, line building, team management |
| **Assistant Coach** | Create/edit content | Scouting reports, drill creation, specialized analysis |
| **Trainer** | View roster & schedule | Player health tracking, practice coordination |
| **Video Analyst** | Full video access | Video upload/tagging, breakdown creation, highlight reels |
| **Player** | View-only (assigned) | Personal stats, video clips, schedule, announcements |

---

## 📊 Data Model Summary

**14 Core Entities:**

1. **Users** - All system users (coaches, staff, players)
2. **Teams** - Hockey teams with season tracking
3. **TeamMembers** - Junction table linking staff to teams
4. **Players** - Roster members with profiles
5. **Games** - Scheduled/completed games
6. **Videos** - Game footage and clips
7. **VideoTags** - Timestamp markers on videos
8. **Notes** - Coaching observations and reports
9. **Drills** - Practice drill library
10. **PracticePlans** - Scheduled practices with drills
11. **PracticePlanDrills** - Junction table for practice-drill linking
12. **LineCombinations** - Saved line configurations
13. **PlayerStats** - Performance statistics
14. **Announcements** - Team communications

**Key Relationships:**
- Teams → Players (1:many)
- Games → Videos (1:many)
- Videos → VideoTags (1:many)
- PracticePlans ↔ Drills (many:many through junction)

---

## 🚀 Development Roadmap

### Phase 1: Core Workflow (Weeks 1-16)
**Goal:** Launch functional MVP

- Week 1-2: Project setup & infrastructure
- Week 3-5: Authentication & team management
- Week 6-8: Roster & player management
- Week 9-11: Game management & video upload
- Week 12-13: Video tagging & notes
- Week 14-15: Practice planning
- Week 16: MVP polish & launch

### Phase 2: Analytics (Weeks 17-26)
**Goal:** Add performance tracking and advanced video

- Player statistics & dashboards
- Advanced video features (clipping, frame-by-frame)
- Line combination builder
- Scouting report templates

### Phase 3: Communication (Weeks 27-34)
**Goal:** Enable team collaboration

- Announcements & notifications
- Resource sharing
- Real-time collaboration features

### Future Phases
- Mobile applications (iOS/Android)
- Advanced analytics (shot charts, heat maps)
- Third-party integrations

---

## 🎨 Design Philosophy

**1. Coach-First Design**
- Desktop-optimized for primary work environment
- Quick access to frequent tasks
- Minimal clicks to complete workflows

**2. Video-Centric Workflow**
- Video is the heart of coaching analysis
- Seamless video player integration
- Easy tagging and note-taking while watching

**3. Progressive Disclosure**
- Show essential information first
- Advanced features revealed as needed
- Clean, uncluttered interfaces

**4. Performance-Focused**
- Page loads < 2 seconds
- Video streaming < 1 second to start
- Responsive interactions throughout

---

## 📈 Sample User Flows

### Flow 1: Post-Game Analysis
1. Coach uploads game footage via drag-drop
2. Reviews video, pauses at key moments
3. Tags plays (goals, penalties, turnovers)
4. Creates coaching notes linked to timestamps
5. Identifies areas for improvement
6. Builds practice plan addressing weaknesses
7. Shares with assistant coaches

**Time:** ~20-30 minutes (excluding video watching)

### Flow 2: Practice Planning
1. Navigate to Practice Planner
2. Set date, time, location
3. Add focus areas (e.g., power play, passing)
4. Browse drill library
5. Drag drills into time slots
6. Adjust duration and order
7. Save and export PDF

**Time:** ~10-15 minutes

### Flow 3: Line Building
1. Open Line Combination Builder
2. Drag players into positions
3. Create 4 forward lines
4. Set defensive pairs
5. Configure special teams (PP, PK)
6. Save and export line sheet

**Time:** ~10-15 minutes

---

## 🔍 API Highlights

### Video Upload Flow
```
1. Client requests upload URL from API
   POST /games/:gameId/videos/upload-url

2. API generates pre-signed S3 URL
   Returns: { upload_url, video_id, expires_in }

3. Client uploads directly to S3
   (No API server bandwidth used)

4. Client confirms upload complete
   POST /videos/:videoId/complete

5. API creates database record
   System queues thumbnail generation
```

### Video Streaming
```
GET /videos/:videoId
Returns:
{
  "stream_url": "https://cdn.../video.m3u8",
  "stream_expires_at": "timestamp",
  "tags": [...],
  "metadata": {...}
}
```

### Player Statistics
```
GET /players/:playerId/stats
Returns:
{
  "season_totals": { goals, assists, points, ... },
  "game_by_game": [ ... ]
}
```

---

## 🛠️ Implementation Best Practices

### Code Quality
- **TypeScript strict mode** - No `any` types
- **Functional React components** - Hooks-based
- **RESTful API design** - Proper HTTP verbs and status codes
- **Migration-based schema** - Version-controlled database changes

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Minimum 70% code coverage

### Performance
- **Database indexes** on foreign keys and query fields
- **CDN for media** delivery with edge caching
- **Pagination** on all list endpoints (max 100 items)
- **Rate limiting** to prevent abuse

### Monitoring
- Error tracking (Sentry, Rollbar)
- Performance monitoring (APM)
- User analytics (privacy-focused)
- Uptime monitoring

---

## 📏 Success Metrics

### User Engagement
- Daily active users
- Video uploads per week
- Practice plans created per month
- Average session duration

### Performance
- Page load times (target: < 2s)
- API response times (target: < 200ms p95)
- Video start time (target: < 1s)
- Error rate (target: < 0.1%)

### Feature Adoption
- % of teams using video tagging
- % of teams using practice planner
- % of teams using line builder
- Average notes per game

---

## 🎯 Target Use Cases

### Youth Hockey Organizations
- U15, U16, U18 AAA teams
- Multiple coaches per team
- Regular game footage review
- Practice planning

### Junior Hockey Teams
- USHL, NAHL, BCHL level
- Professional coaching staff
- Advanced video analysis
- Player development tracking

### High School Programs
- Varsity hockey teams
- Volunteer and paid coaches
- Basic video review
- Team communication

---

## 🚧 Out of Scope (Current Phase)

The following are intentionally excluded from this design phase:

- ❌ Authentication security (OAuth, 2FA, password policies)
- ❌ Data encryption (at-rest, in-transit)
- ❌ Threat modeling and penetration testing
- ❌ HIPAA compliance (medical data)
- ❌ Payment processing
- ❌ Multi-language support (i18n)
- ❌ Offline mode

These will be addressed in future security and enhancement phases.

---

## 📖 How to Use This Design

### For Product Managers
1. Review **HOCKEY_COACHING_APP_DESIGN.md** for feature priorities
2. Use user roles and workflows to create user stories
3. Reference roadmap for sprint planning

### For Designers
1. Review **UI_UX_AND_ROADMAP.md** for screen layouts
2. Use text wireframes as starting point
3. Create high-fidelity mockups based on descriptions

### For Backend Developers
1. Review **API_DESIGN.md** for all endpoints
2. Implement using provided request/response formats
3. Reference data models for database schema

### For Frontend Developers
1. Review **UI_UX_AND_ROADMAP.md** for component structure
2. Implement screens based on wireframes
3. Use API specifications for integration

### For DevOps Engineers
1. Review architecture in **HOCKEY_COACHING_APP_DESIGN.md**
2. Set up PostgreSQL, S3, and API server
3. Configure CDN for video delivery

---

## 🤝 Next Steps

### Immediate Actions
1. ✅ Review all three design documents
2. ✅ Validate requirements with potential users (coaches)
3. ✅ Create high-fidelity mockups
4. ✅ Set up development environment
5. ✅ Begin Phase 1 implementation

### Week 1 Tasks
- Initialize Git repository
- Set up PostgreSQL database
- Create initial schema migration
- Set up S3 bucket and IAM policies
- Create React + Express project structure
- Configure TypeScript
- Set up ESLint and Prettier

### Week 2 Tasks
- Implement authentication endpoints
- Create login/register UI
- Set up JWT middleware
- Create team management endpoints
- Build team creation flow

---

## 📞 Design Questions & Decisions

### Q: Why PostgreSQL over MongoDB?
**A:** Structured relationships between teams, players, games, and videos require strong relational integrity. PostgreSQL offers ACID compliance, excellent JSON support for flexible data, and superior query performance for our use case.

### Q: Why S3 for video storage?
**A:** Videos are large files (1-4GB each). S3 provides cost-effective storage, CDN integration, pre-signed URL support, and scalability. Storing videos in the database would be impractical.

### Q: Why desktop-first instead of mobile-first?
**A:** Coaches primarily review footage and build practice plans at desks/offices with large screens. Video analysis requires screen real estate. Mobile will be added in Phase 4 for on-the-go access.

### Q: Why drag-and-drop for practice planning?
**A:** Coaches are accustomed to physical whiteboards and paper plans. Drag-and-drop provides intuitive, tactile interaction that mirrors existing workflows.

### Q: Why not real-time collaboration in MVP?
**A:** Real-time features add significant complexity (WebSockets, conflict resolution). The core workflow (video review → practice planning) is primarily individual work. Collaboration features come in Phase 3 after validating core value.

---

## 📄 License & Usage

This design document is provided for educational and planning purposes. 

**Design Authored By:** Senior Software Engineer & Product Designer  
**Date:** February 2026  
**Version:** 1.0

---

## 🙏 Acknowledgments

This design draws inspiration from:
- Modern coaching workflows in youth and junior hockey
- Video analysis tools used in professional sports
- Practice planning software across various sports
- Feedback from hockey coaches at multiple levels

---

## 📚 Appendix

### Recommended Reading
- RESTful API Design Best Practices
- React Performance Optimization
- PostgreSQL Indexing Strategies
- Video Streaming Protocols (HLS, DASH)

### Tools & Libraries
- **React:** https://react.dev
- **TailwindCSS:** https://tailwindcss.com
- **shadcn/ui:** https://ui.shadcn.com
- **Express:** https://expressjs.com
- **Prisma:** https://www.prisma.io
- **Video.js:** https://videojs.com

---

**Ready to build the future of hockey coaching!** 🏒

For questions or clarifications, refer to the individual design documents or contact the product team.

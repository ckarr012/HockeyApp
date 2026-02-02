const teams = [
  {
    id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    name: "University Wildcats",
    division: "NCAA Division I",
    season: "2025-2026"
  },
  {
    id: "8d0a7780-8536-51ef-b05c-f18gd2g01bf8",
    name: "State Bears",
    division: "NCAA Division I",
    season: "2025-2026"
  }
];

const players = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    teamId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    firstName: "Connor",
    lastName: "Williams",
    jerseyNumber: 87,
    position: "center",
    birthDate: "2004-03-15",
    height: 185,
    weight: 88,
    shoots: "left",
    status: "active"
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    teamId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    firstName: "Alex",
    lastName: "Thompson",
    jerseyNumber: 29,
    position: "goalie",
    birthDate: "2003-11-22",
    height: 188,
    weight: 92,
    shoots: "left",
    status: "active"
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    teamId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    firstName: "Tyler",
    lastName: "Anderson",
    jerseyNumber: 19,
    position: "left_wing",
    birthDate: "2005-01-10",
    height: 180,
    weight: 82,
    shoots: "left",
    status: "active"
  },
  {
    id: "d4e5f6a7-b8c9-0123-def4-567890123456",
    teamId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    firstName: "Jake",
    lastName: "Martinez",
    jerseyNumber: 44,
    position: "right_defense",
    birthDate: "2004-07-22",
    height: 183,
    weight: 90,
    shoots: "right",
    status: "injured"
  },
  {
    id: "e5f6a7b8-c9d0-1234-ef56-789012345678",
    teamId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    firstName: "Ryan",
    lastName: "O'Connor",
    jerseyNumber: 12,
    position: "right_wing",
    birthDate: "2004-12-05",
    height: 178,
    weight: 85,
    shoots: "right",
    status: "active"
  }
];

const games = [
  {
    id: "f6a7b8c9-d0e1-2345-f678-901234567890",
    teamId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    opponent: "State University Bears",
    gameDate: "2026-02-10T19:00:00Z",
    location: "Home Arena",
    homeAway: "home",
    status: "scheduled",
    teamScore: null,
    opponentScore: null
  },
  {
    id: "a7b8c9d0-e1f2-3456-a789-012345678901",
    teamId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    opponent: "Tech College Titans",
    gameDate: "2026-02-03T18:00:00Z",
    location: "Tech Arena",
    homeAway: "away",
    status: "completed",
    teamScore: 4,
    opponentScore: 2
  },
  {
    id: "b8c9d0e1-f2a3-4567-b890-123456789012",
    teamId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    opponent: "Regional College Eagles",
    gameDate: "2026-01-28T19:30:00Z",
    location: "Home Arena",
    homeAway: "home",
    status: "completed",
    teamScore: 3,
    opponentScore: 3
  },
  {
    id: "c9d0e1f2-a3b4-5678-c901-234567890123",
    teamId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    opponent: "Mountain University",
    gameDate: "2026-02-15T20:00:00Z",
    location: "Mountain Arena",
    homeAway: "away",
    status: "scheduled",
    teamScore: null,
    opponentScore: null
  }
];

const videos = [
  {
    id: "d0e1f2a3-b4c5-6789-d012-345678901234",
    teamId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    title: "Game vs Tech Titans - Full Game",
    gameId: "a7b8c9d0-e1f2-3456-a789-012345678901"
  },
  {
    id: "e1f2a3b4-c5d6-7890-e123-456789012345",
    teamId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    title: "Power Play Practice Drills",
    gameId: null
  }
];

const practices = [
  {
    id: "f2a3b4c5-d6e7-8901-f234-567890123456",
    teamId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    practiceDate: "2026-02-05T14:00:00Z",
    focus: "Power Play Development"
  }
];

module.exports = {
  teams,
  players,
  games,
  videos,
  practices
};

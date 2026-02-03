const API_BASE_URL = 'http://localhost:5000/api';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
  teamId: string;
  teamName: string;
  division: string;
  season: string;
}

export interface Player {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number;
  position: string;
  birthDate: string;
  height: number;
  weight: number;
  shoots: string;
  status: string;
  injuryNote?: string;
}

export interface Game {
  id: string;
  teamId: string;
  opponent: string;
  gameDate: string;
  location: string;
  homeAway: string;
  status: string;
  teamScore: number | null;
  opponentScore: number | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'game' | 'practice' | 'film';
  location?: string;
  homeAway?: string;
  status?: string;
  teamScore?: number | null;
  opponentScore?: number | null;
  opponent?: string;
  focus?: string;
  duration?: number;
  url?: string;
  gameId?: string;
}

export interface KeyPlayer {
  name: string;
  number: number;
  position: string;
  notes: string;
}

export interface ScoutingReport {
  id: string;
  teamId: string;
  gameId: string;
  opponentName: string;
  date: string;
  strengths?: string;
  weaknesses?: string;
  keyPlayersJson?: string;
  tacticalNotes?: string;
  powerPlayTendency?: string;
  goalieWeakness?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Prospect {
  id: string;
  teamId: string;
  name: string;
  position: string;
  gradYear: number;
  currentTeam?: string;
  scoutRating?: number;
  contactInfo?: string;
  status: 'Watching' | 'Contacted' | 'Offered' | 'Committed';
  coachingNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProspectVideo {
  id: string;
  prospectId: string;
  title: string;
  videoUrl: string;
  createdAt?: string;
}

export interface DashboardNote {
  id: string;
  team_id: string;
  title: string;
  content: string;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  team: {
    id: string;
    name: string;
    division: string;
    season: string;
  };
  stats: {
    totalPlayers: number;
    activePlayers: number;
    injuredPlayers: number;
    totalGames: number;
    wins: number;
    losses: number;
    ties: number;
    upcomingGames: number;
    totalVideos: number;
    totalPractices: number;
  };
  nextGame: Game | null;
  nextPractice: {
    id: string;
    teamId: string;
    practiceDate: string;
    focus: string;
  } | null;
}

export async function fetchPlayers(teamId: string): Promise<Player[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/players`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch players: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.players;
}

export async function fetchGames(teamId: string): Promise<Game[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/games`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.games;
}

export async function createGame(teamId: string, gameData: {
  game_date: string;
  opponent: string;
  location: string;
  home_away: string;
  status?: string;
}): Promise<{ gameId: string }> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gameData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create game: ${response.statusText}`);
  }
  
  return response.json();
}

export async function updateGameScore(gameId: string, teamScore: number, opponentScore: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/games/${gameId}/score`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ teamScore, opponentScore }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update game score: ${response.statusText}`);
  }
}

export async function deleteGame(gameId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/games/${gameId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete game: ${response.statusText}`);
  }
}

export async function deleteVideo(videoId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/videos/${videoId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete video: ${response.statusText}`);
  }
}

export async function fetchCalendar(teamId: string): Promise<CalendarEvent[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/calendar`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch calendar: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.events;
}

export async function fetchDashboard(teamId: string): Promise<DashboardData> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/dashboard`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
  }
  
  return response.json();
}

export async function login(username: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });
  
  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.user;
}

export interface Video {
  id: string;
  team_id: string;
  title: string;
  url?: string;
  game_id?: string;
  created_at: string;
}

export interface Drill {
  id: string;
  practice_id: string;
  name: string;
  duration?: number;
  description?: string;
  drill_order: number;
}

export interface Practice {
  id: string;
  team_id: string;
  practice_date: string;
  focus: string;
  duration?: number;
  location?: string;
  drills: Drill[];
}

export async function fetchVideos(teamId: string): Promise<Video[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/videos`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch videos: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.videos;
}

export async function createVideo(teamId: string, title: string, url?: string): Promise<Video> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/videos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, url }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create video: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.video;
}

export async function fetchPractices(teamId: string): Promise<Practice[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/practices`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch practices: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.practices;
}

export async function createPractice(teamId: string, practiceData: {
  practice_date: string;
  focus: string;
  duration: number;
  location: string;
  drills: Array<{
    name: string;
    duration: number;
    description: string;
  }>;
}): Promise<{ practiceId: string }> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/practices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(practiceData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create practice: ${response.statusText}`);
  }
  
  return response.json();
}

export async function deletePractice(practiceId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/practices/${practiceId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete practice: ${response.statusText}`);
  }
}

export interface Lineup {
  id: string;
  team_id: string;
  name: string;
  lw_id?: string;
  c_id?: string;
  rw_id?: string;
  ld_id?: string;
  rd_id?: string;
  g_id?: string;
  lw_first_name?: string;
  lw_last_name?: string;
  lw_number?: number;
  c_first_name?: string;
  c_last_name?: string;
  c_number?: number;
  rw_first_name?: string;
  rw_last_name?: string;
  rw_number?: number;
  ld_first_name?: string;
  ld_last_name?: string;
  ld_number?: number;
  rd_first_name?: string;
  rd_last_name?: string;
  rd_number?: number;
  g_first_name?: string;
  g_last_name?: string;
  g_number?: number;
}

export interface PlayerStats {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number: number;
  position: string;
  total_goals: number;
  total_assists: number;
  total_points: number;
  total_shots: number;
  total_blocks: number;
  total_pims: number;
  games_played: number;
}

export async function fetchLineups(teamId: string): Promise<Lineup[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/lineups`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch lineups: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.lineups;
}

export async function createLineup(teamId: string, lineupData: any): Promise<Lineup> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/lineups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(lineupData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create lineup: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.lineup;
}

export async function updateLineup(lineupId: string, lineupData: any): Promise<Lineup> {
  const response = await fetch(`${API_BASE_URL}/teams/lineups/${lineupId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(lineupData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update lineup: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.lineup;
}

export async function fetchTeamStats(teamId: string): Promise<PlayerStats[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/stats`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.stats;
}

export async function recordGameStats(gameId: string, stats: any[]): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/games/${gameId}/stats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ stats }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to record stats: ${response.statusText}`);
  }
}

export async function updatePlayerStatus(playerId: string, status: string, injuryNote?: string): Promise<Player> {
  const response = await fetch(`${API_BASE_URL}/players/${playerId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, injury_note: injuryNote }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update player status: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.player;
}

export async function fetchScoutingReports(teamId: string): Promise<ScoutingReport[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/scouting`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch scouting reports: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.reports;
}

export async function fetchScoutingReportByGame(gameId: string, teamId: string): Promise<ScoutingReport | null> {
  const response = await fetch(`${API_BASE_URL}/teams/scouting/games/${gameId}?teamId=${teamId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch scouting report: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.report;
}

export async function createScoutingReport(teamId: string, reportData: any): Promise<ScoutingReport> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/scouting`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reportData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create scouting report: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.report;
}

export async function updateScoutingReport(reportId: string, reportData: any): Promise<ScoutingReport> {
  const response = await fetch(`${API_BASE_URL}/teams/scouting/${reportId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reportData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update scouting report: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.report;
}

// Recruiting API functions
export async function fetchProspects(teamId: string): Promise<Prospect[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/prospects`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch prospects: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.prospects;
}

export async function fetchProspectDetails(prospectId: string, teamId: string): Promise<{ prospect: Prospect; videos: ProspectVideo[] }> {
  const response = await fetch(`${API_BASE_URL}/prospects/${prospectId}?teamId=${teamId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch prospect details: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function createProspect(teamId: string, prospectData: any): Promise<Prospect> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/prospects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(prospectData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create prospect: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.prospect;
}

export async function updateProspect(prospectId: string, prospectData: any): Promise<Prospect> {
  const response = await fetch(`${API_BASE_URL}/prospects/${prospectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(prospectData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update prospect: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.prospect;
}

export async function deleteProspect(prospectId: string, teamId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/prospects/${prospectId}?teamId=${teamId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete prospect: ${response.statusText}`);
  }
}

// Dashboard Notes API
export async function fetchDashboardNotes(teamId: string): Promise<DashboardNote[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/notes`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard notes: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.notes;
}

export async function createDashboardNote(teamId: string, noteData: { title: string; content: string; category?: string }): Promise<{ noteId: string }> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create dashboard note: ${response.statusText}`);
  }
  
  return response.json();
}

export async function updateDashboardNote(noteId: string, noteData: { title: string; content: string; category?: string }): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/notes/${noteId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update dashboard note: ${response.statusText}`);
  }
}

export async function deleteDashboardNote(noteId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/notes/${noteId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete dashboard note: ${response.statusText}`);
  }
}

// Team Settings API
export async function updateTeamSettings(teamId: string, settings: { name?: string; season?: string; division?: string }): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update team settings: ${response.statusText}`);
  }
}

export async function addProspectVideo(prospectId: string, teamId: string, videoData: { title: string; videoUrl: string }): Promise<ProspectVideo> {
  const response = await fetch(`${API_BASE_URL}/prospects/${prospectId}/videos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ teamId, ...videoData }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to add prospect video: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.video;
}

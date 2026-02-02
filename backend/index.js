require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const videoRoutes = require('./routes/videoRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const lineupRoutes = require('./routes/lineupRoutes');
const statsRoutes = require('./routes/statsRoutes');
const playerRoutes = require('./routes/playerRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const scoutingRoutes = require('./routes/scoutingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hockey App API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/teams', videoRoutes);
app.use('/api/teams', practiceRoutes);
app.use('/api/teams', lineupRoutes);
app.use('/api/teams', statsRoutes);
app.use('/api/teams', calendarRoutes);
app.use('/api/teams', scoutingRoutes);
app.use('/api/players', playerRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🏒 Hockey App Backend running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available:`);
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   - GET  http://localhost:${PORT}/api/teams/:teamId/players`);
  console.log(`   - GET  http://localhost:${PORT}/api/teams/:teamId/dashboard`);
  console.log(`   - GET  http://localhost:${PORT}/api/teams/:teamId/videos`);
  console.log(`   - POST http://localhost:${PORT}/api/teams/:teamId/videos`);
  console.log(`   - GET  http://localhost:${PORT}/api/teams/:teamId/practices`);
  console.log(`   - GET  http://localhost:${PORT}/api/teams/:teamId/lineups`);
  console.log(`   - POST http://localhost:${PORT}/api/teams/:teamId/lineups`);
  console.log(`   - PUT  http://localhost:${PORT}/api/teams/lineups/:lineupId`);
  console.log(`   - GET  http://localhost:${PORT}/api/teams/:teamId/stats`);
  console.log(`   - POST http://localhost:${PORT}/api/teams/games/:gameId/stats`);
});

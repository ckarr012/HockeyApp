const { getDb, saveDb } = require('../db/database');

const LINE_STRUCTURE = {
  forward_1: ['lw', 'c', 'rw'],
  forward_2: ['lw', 'c', 'rw'],
  forward_3: ['lw', 'c', 'rw'],
  forward_4: ['lw', 'c', 'rw'],
  defense_1: ['ld', 'rd'],
  defense_2: ['ld', 'rd'],
  defense_3: ['ld', 'rd'],
  pp1: ['lw', 'c', 'rw', 'ld', 'rd'],
  pp2: ['lw', 'c', 'rw', 'ld', 'rd'],
  pk1: ['f1', 'f2', 'ld', 'rd'],
  pk2: ['f1', 'f2', 'ld', 'rd'],
  goalies: ['starter', 'backup'],
};

const getLineupsByTeamId = async (teamId) => {
  const db = await getDb();

  const lineupsResult = db.exec('SELECT * FROM lineups WHERE team_id = ? ORDER BY created_at', [teamId]);
  if (lineupsResult.length === 0) return [];

  const lineupCols = lineupsResult[0].columns;
  const lineupRows = lineupsResult[0].values.map(row => {
    const obj = {};
    lineupCols.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });

  const lineupIds = lineupRows.map(l => `'${l.id}'`).join(',');

  const slotsResult = db.exec(`
    SELECT ls.lineup_id, ls.line_type, ls.position, ls.player_id,
           p.first_name, p.last_name, p.jersey_number, p.position AS player_position, p.status
    FROM lineup_slots ls
    LEFT JOIN players p ON ls.player_id = p.id
    WHERE ls.lineup_id IN (${lineupIds})
  `);

  const slotRows = [];
  if (slotsResult.length > 0) {
    const slotCols = slotsResult[0].columns;
    slotsResult[0].values.forEach(row => {
      const obj = {};
      slotCols.forEach((col, i) => obj[col] = row[i]);
      slotRows.push(obj);
    });
  }

  const slotsByLineup = {};
  slotRows.forEach(slot => {
    if (!slotsByLineup[slot.lineup_id]) slotsByLineup[slot.lineup_id] = {};
    if (!slotsByLineup[slot.lineup_id][slot.line_type]) slotsByLineup[slot.lineup_id][slot.line_type] = {};
    slotsByLineup[slot.lineup_id][slot.line_type][slot.position] = slot.player_id ? {
      id: slot.player_id,
      firstName: slot.first_name,
      lastName: slot.last_name,
      jerseyNumber: slot.jersey_number,
      playerPosition: slot.player_position,
      status: slot.status,
    } : null;
  });

  return lineupRows.map(lineup => ({
    id: lineup.id,
    teamId: lineup.team_id,
    name: lineup.name,
    createdAt: lineup.created_at,
    updatedAt: lineup.updated_at,
    slots: slotsByLineup[lineup.id] || {},
  }));
};

const createLineup = async (teamId, name) => {
  const db = await getDb();
  const id = crypto.randomUUID();

  db.run('INSERT INTO lineups (id, team_id, name) VALUES (?, ?, ?)', [id, teamId, name]);

  for (const [lineType, positions] of Object.entries(LINE_STRUCTURE)) {
    for (const position of positions) {
      db.run(
        'INSERT INTO lineup_slots (id, lineup_id, line_type, position, player_id) VALUES (?, ?, ?, ?, ?)',
        [crypto.randomUUID(), id, lineType, position, null]
      );
    }
  }

  await saveDb();
  return { id, teamId, name, slots: {} };
};

const updateLineupSlots = async (lineupId, name, slots) => {
  const db = await getDb();

  if (name) {
    db.run('UPDATE lineups SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [name, lineupId]);
  } else {
    db.run('UPDATE lineups SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [lineupId]);
  }

  for (const [lineType, positions] of Object.entries(slots)) {
    for (const [position, playerId] of Object.entries(positions)) {
      db.run(
        'UPDATE lineup_slots SET player_id = ? WHERE lineup_id = ? AND line_type = ? AND position = ?',
        [playerId || null, lineupId, lineType, position]
      );
    }
  }

  await saveDb();
};

const deleteLineup = async (lineupId) => {
  const db = await getDb();
  db.run('DELETE FROM lineup_slots WHERE lineup_id = ?', [lineupId]);
  db.run('DELETE FROM lineups WHERE id = ?', [lineupId]);
  await saveDb();
};

module.exports = { getLineupsByTeamId, createLineup, updateLineupSlots, deleteLineup };

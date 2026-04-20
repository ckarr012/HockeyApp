const fetch = require('node-fetch');

(async () => {
  console.log('Testing matchup generation endpoint...\n');
  
  const response = await fetch('http://localhost:5000/api/teams/33ce1096-a31f-4d20-9f35-a56b90b087df/matchups/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      teamId: '33ce1096-a31f-4d20-9f35-a56b90b087df',
      lineupId: '5c2a267a-fe02-4e8b-9eaf-30cb3399debb',
      opponentName: 'Lindenwood',
      gameId: null
    })
  });
  
  const data = await response.json();
  console.log('\nResponse status:', response.status);
  console.log('Response data:', JSON.stringify(data, null, 2).substring(0, 500));
})();

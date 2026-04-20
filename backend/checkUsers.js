const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'hockey.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Check existing users
  db.all('SELECT id, username, role, team_id FROM users', [], (err, users) => {
    if (err) {
      console.error('Error fetching users:', err);
      return;
    }

    console.log('\n📋 Current Users:');
    if (users.length === 0) {
      console.log('No users found in database.\n');
      
      // Create a test user
      console.log('Creating test user...');
      const username = 'coach';
      const password = 'password123';
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      db.run(
        'INSERT INTO users (username, password_hash, role, team_id) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, 'coach', 1],
        function(err) {
          if (err) {
            console.error('Error creating user:', err);
          } else {
            console.log('\n✅ Test user created!');
            console.log('Username: coach');
            console.log('Password: password123');
            console.log('Role: coach');
            console.log('Team ID: 1\n');
          }
          db.close();
        }
      );
    } else {
      console.table(users);
      console.log('\n✅ Users exist. Use one of the above usernames to login.\n');
      db.close();
    }
  });
});

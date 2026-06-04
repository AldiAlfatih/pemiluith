const { Client } = require('pg');
require('dotenv').config();

async function createDummyElection() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  const userRes = await client.query("SELECT id FROM users LIMIT 1");
  const userId = userRes.rows[0].id;

  const startAt = new Date(Date.now() - 3600000); // 1 hour ago
  const endAt = new Date(Date.now() + 60000); // Ends in 60 seconds
  const id = 'dummy-election-1';
  
  await client.query(`
    INSERT INTO elections (id, title, description, type, method, min_choices, max_choices, start_at, end_at, status, created_by, updated_at) 
    VALUES ($1, 'Pemilihan Nama Angkatan (Simulasi)', 'Ini simulasi', 'NAMA_ANGKATAN', 'SINGLE_CHOICE', 1, 1, $2, $3, 'ACTIVE', $4, NOW())
    ON CONFLICT (id) DO UPDATE SET end_at = EXCLUDED.end_at, status = 'ACTIVE'
  `, [id, startAt, endAt, userId]);
  
  await client.query(`
    INSERT INTO election_options (id, election_id, name, order_number, updated_at)
    VALUES ('dummy-opt-1', $1, 'Alpha', 1, NOW()), ('dummy-opt-2', $1, 'Beta', 2, NOW())
    ON CONFLICT DO NOTHING
  `, [id]);
  
  console.log("Created dummy election to end at", endAt);
  await client.end();
}
createDummyElection().catch(console.error);

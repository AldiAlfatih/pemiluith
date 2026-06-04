const { Client } = require('pg');
require('dotenv').config();

async function updateTime() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  const endAt = new Date(Date.now() + 45000); // Ends in 45 seconds
  await client.query("UPDATE elections SET end_at = $1 WHERE status = 'ACTIVE'", [endAt]);
  
  console.log("Updated elections to end at", endAt);
  await client.end();
}
updateTime().catch(console.error);

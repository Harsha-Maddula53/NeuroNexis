require('dotenv').config();
const { Client } = require('pg');

async function testHeartbeat() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    const res = await client.query('SELECT 1 as connected');
    console.log("Heartbeat query successful:", res.rows[0]);
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await client.end();
  }
}

testHeartbeat();

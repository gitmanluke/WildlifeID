// broker.js
import { createClient } from 'redis';

export async function connect() {
  const client = createClient();
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  return client;
}
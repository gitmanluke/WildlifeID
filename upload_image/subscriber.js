import { createClient } from 'redis';

const client = createClient();
client.on('error', err => console.error(err));
await client.connect();

await client.subscribe('image.submitted', (message, channel) => {
  console.log(`Received on ${channel}:`, JSON.parse(message));
});

console.log('Listening for events...');

import { createClient } from 'redis';

const client = createClient();
client.on('error', err => console.error(err));
await client.connect();

await client.publish('image.submitted', JSON.stringify({
  type: 'publish',
  topic: 'image.submitted',
  event_id: 'evt_001',
  payload: {
    image_id: 'img_001',
    path: 'images/wildlife_0001.jpg',
    source: 'camera_A',
    timestamp: new Date().toISOString()
  }
}));

console.log('Event published!');
await client.disconnect();


import { MongoClient } from 'mongodb';

const URI = 'mongodb://127.0.0.1:27017/?directConnection=true';

export async function connectDB() {
  const client = new MongoClient(URI);
  await client.connect();
  return client.db('wildlifeDB').collection('annotations');
}

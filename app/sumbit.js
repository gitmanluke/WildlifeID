import { connect } from '../broker/connect.js';

let redisClient;

async function routes(fastify, options) {
  if (!redisClient) {
    redisClient = await connect();
  }

  fastify.post('/submit', async (request, reply) => {
    const { path } = request.body;
    if (!path) {
      return reply.code(400).send({ error: 'path is required' });
    }

    const count = await redisClient.incr('counter:submissions');
    const id = String(count).padStart(4, '0');

    const event = {
      event_id: `evt_${id}`,
      timestamp: new Date().toISOString(),
      payload: {
        image_id: `img_${id}`,
        file_path: path,
        mode: 'index'
      }
    };

    await redisClient.publish('image.submitted', JSON.stringify(event));
    return event;
  });
}

export default routes;

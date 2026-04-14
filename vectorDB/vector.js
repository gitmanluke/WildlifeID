import { Module } from './module.js';

class Vector extends Module {
  inputChannels() {
    return ['embedding.complete'];
  }

  outputChannels() {
    return ['objects.submitted'];
  }

  async handleEvent(channel, message) {
    const event = JSON.parse(message);
    console.log('Vector:', event.payload.image_id, '| mode:', event.payload.mode);

    if (event.payload.mode === 'index') {
      // index the embedding, no publish
    } else if (event.payload.mode === 'query') {
      const result = {
        event_id: event.event_id,
        payload: {
          image_ids: ['img_1042', 'img_0891']  // placeholder similarity search results
        }
      };

      await this.publisher.publish(this.outputChannels()[0], JSON.stringify(result));
    }
  }
}

export { Vector };

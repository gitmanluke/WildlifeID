import { Module } from './module.js';

class Embed extends Module {
  inputChannels() {
    return ['annotation.complete'];
  }

  outputChannels() {
    return ['embedding.complete'];
  }

  async handleEvent(channel, message) {
    const event = JSON.parse(message);
    console.log('Embedding:', event.payload.image_id);

    const result = {
      event_id: event.event_id,
      payload: {
        image_id: event.payload.image_id,
        mode: event.payload.mode,
        embedding: 'PLACEHOLDER_VECTOR_EMBEDDING'
      }
    };

    await this.publisher.publish(this.outputChannels()[0], JSON.stringify(result));
  }
}

export { Embed };

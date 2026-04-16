import { Module } from '../module.js';

class Embed extends Module {
  inputChannels() {
    return ['annotation.complete'];
  }

  outputChannels() {
    return ['embedding.complete'];
  }

  async handleEvent(channel, message) {
    let event;
    try {
      event = JSON.parse(message);
    } catch {
      console.log('Invalid JSON, dropping message');
      return;
    }
    if (!(await this.validate(event))) return;

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

  async validate(result) {
    if (!result.event_id)         { console.log('No event ID, aborting embedding'); return false; }
    if (!result.payload.image_id) { console.log('No image ID, aborting embedding'); return false; }
    if (!result.payload.mode)     { console.log('No mode, aborting embedding'); return false; }
    return true;
  }
}

export { Embed };

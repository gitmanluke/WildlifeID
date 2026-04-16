import { Module } from '../module.js';

class Vector extends Module {
  inputChannels() {
    return ['embedding.complete'];
  }

  outputChannels() {
    return ['objects.submitted'];
  }

  async handleEvent(channel, message) {
    let event;
    try {
      event = JSON.parse(message);
    } catch {
      console.log('Invalid JSON, dropping message');
      return;
    }
    console.log('Vector:', event.payload.image_id, '| mode:', event.payload.mode);

    if (!(await this.validate(event))) return;

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

  async validate(event) {
    if (!event.event_id)              { console.log('No event ID, aborting vector op'); return false; }
    if (!event.payload.image_id)      { console.log('No image ID, aborting vector op'); return false; }
    if (!event.payload.mode)          { console.log('No mode, aborting vector op'); return false; }
    if (!event.payload.embedding)     { console.log('No embedding, aborting vector op'); return false; }
    return true;
  }
}

export { Vector };

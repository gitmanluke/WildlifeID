import { Module } from '../module.js';

class Annotate extends Module {
  inputChannels() {
    return ['image.uploaded'];
  }

  outputChannels() {
    return ['annotation.complete'];
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
    if (await this.isDuplicate(event.event_id)) { console.log('Duplicate event, skipping'); return; }

    console.log('Annotating:', event.payload.image_id);

    const result = {
      event_id: event.event_id,
      payload: {
        image_id: event.payload.image_id,
        mode: event.payload.mode,
        objects: [
          { label: 'deer', confidence: 0.91, bbox: [12, 44, 188, 200] }  // placeholder
        ]
      }
    };

    await this.publisher.publish(this.outputChannels()[0], JSON.stringify(result));
    await this.markProcessed(event.event_id);
  }

  async validate(result) {
    if (!result.event_id)         { console.log('No event ID, aborting annotation'); return false; }
    if (!result.payload.image_id) { console.log('No image ID, aborting annotation'); return false; }
    if (!result.payload.mode)     { console.log('No mode, aborting annotation'); return false; }
    return true;
  }
}

export { Annotate };

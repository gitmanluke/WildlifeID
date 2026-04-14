import { Module } from './module.js';

class Annotate extends Module {
  inputChannels() {
    return ['image.uploaded'];
  }

  outputChannels() {
    return ['annotation.complete'];
  }

  async handleEvent(channel, message) {
    const event = JSON.parse(message);
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
  }
}

export { Annotate };

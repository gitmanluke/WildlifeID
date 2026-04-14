import { Module } from './module.js';

class Document extends Module {
  inputChannels() {
    return ['annotation.complete', 'objects.submitted'];
  }

  outputChannels() {
    return [];
  }

  async handleEvent(channel, message) {
    const event = JSON.parse(message);

    if (channel === 'annotation.complete') {
      console.log('Document write:', event.payload.image_id);
      // write image_id + objects to DB
    } else if (channel === 'objects.submitted') {
      console.log('Document read:', event.payload.image_ids);
      // fetch full records by image_ids from DB, return to user
    }
  }
}

export { Document };

import { Module } from '../module.js';
import { connectDB } from './connect.js';

class Document extends Module {
  constructor(subscriber, publisher, redisClient) {
    super(subscriber, publisher, redisClient);
    this.collection = null;
  }

  async init() {
    this.collection = await connectDB();
  }

  inputChannels() {
    return ['annotation.complete', 'objects.submitted'];
  }

  outputChannels() {
    return [];
  }

  async handleEvent(channel, message) {
    let event;
    try {
      event = JSON.parse(message);
    } catch {
      console.log('Invalid JSON, dropping message');
      return;
    }

    if (!(await this.validate(channel, event))) return;
    if (await this.isDuplicate(event.event_id)) { console.log('Duplicate event, skipping'); return; }

    if (channel === 'annotation.complete') {
      console.log('Document write:', event.payload.image_id);
      await this.collection.updateOne(
        { image_id: event.payload.image_id },
        { $set: { image_id: event.payload.image_id, objects: event.payload.objects } },
        { upsert: true }
      );
    } else if (channel === 'objects.submitted') {
      console.log('Document read:', event.payload.image_ids);
      // fetch full records by image_ids from DB, return to user
    }

    await this.markProcessed(event.event_id);
  }

  async validate(channel, event) {
    if (!event.event_id) { console.log('No event ID, aborting document op'); return false; }
    if (channel === 'annotation.complete') {
      if (!event.payload.image_id) { console.log('No image ID, aborting document write'); return false; }
    } else if (channel === 'objects.submitted') {
      if (!event.payload.image_ids) { console.log('No image IDs, aborting document read'); return false; }
    }
    return true;
  }
}

export { Document };

import { Module } from '../module.js';

class Upload extends Module {
  inputChannels() {
    return ['image.submitted'];
  }

  outputChannels() {
    return ['image.uploaded'];
  }

  async handleEvent(message) {
    const event = JSON.parse(message);
    console.log('Uploading:', event.payload.image_id);

    const result = {
      event_id: event.event_id,
      payload: {
        image_id: event.payload.image_id,
        file_path: event.payload.file_path,
        mode: event.payload.mode
      }
    };

    // upload logic, add processing or whatever before publishing that is done
    await this.publisher.publish(this.outputChannels()[0], JSON.stringify(result));
  }
}

export {Upload};

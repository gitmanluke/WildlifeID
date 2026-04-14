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
    if (!(await this.validate(result))) return;

    // upload logic, add processing or whatever before publishing that is done
    console.log("HELLO I HAVE MADE IT PAST VALIDATION")
    await this.publisher.publish(this.outputChannels()[0], JSON.stringify(result));
  }
  async validate(result) {
    // handling of misinput
    if (!result.event_id){ console.log('No event ID, aborting upload'); return false;}
    if (!result.payload.image_id){ console.log('No Image ID, aborting upload'); return false; }
    if (!result.payload.file_path){ console.log('No File Path, aborting upload'); return false; }
    if (!result.payload.mode){ console.log('No mode selected, aborting upload'); return false; }
    return true;
  }
}

export {Upload};

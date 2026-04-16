import { Module } from '../module.js';

class Upload extends Module {
  inputChannels() {
    return ['image.submitted'];
  }

  outputChannels() {
    return ['image.uploaded'];
  }

  async handleEvent(channel, message) {
    let event;
    try {
      event = JSON.parse(message);
    } catch {
      console.log('Invalid JSON formatting, aborting upload');
      return;
    }
    // validate the message before moving on
    if (!(await this.validate(event))) return;
    if (await this.isDuplicate(event.event_id)) { console.log('Duplicate event, skipping'); return; }
    console.log('Uploading:', event.payload.image_id);
    // extract individual fields
    const result = {
      event_id: event.event_id,
      payload: {
        image_id: event.payload.image_id,
        file_path: event.payload.file_path,
        mode: event.payload.mode
      }
    };

    // upload logic, add processing or whatever before publishing that is done

    // publish that processing is complete and any other information
    await this.publisher.publish(this.outputChannels()[0], JSON.stringify(result));
    await this.markProcessed(event.event_id);
  }
  async validate(result) {
    // handling of misinput
    if (!((typeof result) === 'object')){return false;} // checks if object
    if (!result.event_id){ console.log('No event ID, aborting upload'); return false;}
    if (!result.payload.image_id){ console.log('No Image ID, aborting upload'); return false; }
    if (!result.payload.file_path){ console.log('No File Path, aborting upload'); return false; }
    if (!result.payload.mode){ console.log('No mode selected, aborting upload'); return false; }
    return true;
  }
}

export {Upload};

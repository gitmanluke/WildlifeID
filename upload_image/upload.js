import { Module } from '../module.js';
import { copyFile, mkdir } from 'fs/promises';
import { join, basename } from 'path';

const projectDir = new URL('..', import.meta.url).pathname; // → WildlifeID/

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

    // upload logic, copy the inputted file to the /images/ directory
    let dest;
    try {
      dest = await this.copyFileToImages(event.payload.file_path, projectDir);
    } catch (err) {
      console.error('Error copying file:', err.message);
      return;
    }

    // create new payload with updated file path
    const result = {
      event_id: event.event_id,
      payload: {
        image_id: event.payload.image_id,
        file_path: dest,
        mode: event.payload.mode
      }
    };

    // publish payload to the redis stream 
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
  async copyFileToImages(sourcePath, projectDir, subFolder = '') {
    const imagesDir = join(projectDir, 'images', subFolder);
  
    // Ensure the target directory exists (creates it if it doesn't)
    await mkdir(imagesDir, { recursive: true });
  
    const fileName = basename(sourcePath);
    const destPath = join(imagesDir, fileName);
  
    await copyFile(sourcePath, destPath);
  
    console.log(`✅ Copied: ${fileName}`);
    console.log(`   From: ${sourcePath}`);
    console.log(`   To:   ${destPath}`);
  
    return destPath;
  }
}

export {Upload};

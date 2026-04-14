import { Upload } from './upload.js'
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';                                                                                   

describe('Upload', () => { 
  // create upload with fake publish and subscriber fn
  const publisher  = { publish: jest.fn() };
  const subscriber = { subscribe: jest.fn() };                                                                                                                         
  const worker = new Upload(subscriber, publisher);  
  // clear publisher so that call count is accurate
  beforeEach(() => {
    publisher.publish.mockClear();
  }); 
                                                                                                                                                                        
  it('valid message', async () => {  
    const test_message = {
      event_id: '001',
      payload: {
        image_id: 'wildlife_01',
        file_path: '/images/wildlife_0001',
        mode: 'index'
      }
    };                                                                                                                             
    await worker.handleEvent(JSON.stringify(test_message))
    await worker.handleEvent(JSON.stringify(test_message))
    expect(publisher.publish).toHaveBeenCalledTimes(2)                                                                                                                                              
  });
                                                                                                                                                                     
  it('message missing event id', async () => {                                                                                                                          
    const test_message = {
      event_id: null,
      payload: {
        image_id: 'wildlife_01',
        file_path: '/images/wildlife_0001',
        mode: 'index'
      }
    };                                                                                                                             
    await worker.handleEvent(JSON.stringify(test_message))
    expect(publisher.publish).not.toHaveBeenCalled()   
  });

});




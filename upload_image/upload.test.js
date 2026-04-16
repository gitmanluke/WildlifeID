import { Upload } from './upload.js'
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Upload', () => {
  // create upload with fake publish, subscriber, and redis client
  const publisher    = { publish: jest.fn() };
  const subscriber   = { subscribe: jest.fn() };
  const redisClient  = { get: jest.fn(), set: jest.fn() };
  const worker = new Upload(subscriber, publisher, redisClient);
  // clear mocks so that call counts are accurate
  beforeEach(() => {
    publisher.publish.mockClear();
    redisClient.get.mockClear();
    redisClient.set.mockClear();
    redisClient.get.mockResolvedValue(null); // default: not a duplicate
    redisClient.set.mockResolvedValue('OK'); // default: markProcessed succeeds
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
    await worker.handleEvent('image.submitted', JSON.stringify(test_message))
    expect(publisher.publish).toHaveBeenCalledTimes(1)                                                                                                                                              
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
    await worker.handleEvent('image.submitted', JSON.stringify(test_message))
    expect(publisher.publish).not.toHaveBeenCalled()
  });

  it('message missing image id', async () => {
    const test_message = {
      event_id: '001',
      payload: {
        image_id: null,
        file_path: '/images/wildlife_0001',
        mode: 'index'
      }
    };
    await worker.handleEvent('image.submitted', JSON.stringify(test_message))
    expect(publisher.publish).not.toHaveBeenCalled()
  });

  it('message missing file path', async () => {
    const test_message = {
      event_id: '001',
      payload: {
        image_id: 'wildlife_01',
        file_path: null,
        mode: 'index'
      }
    };
    await worker.handleEvent('image.submitted', JSON.stringify(test_message))
    expect(publisher.publish).not.toHaveBeenCalled()
  });

  it('message missing mode', async () => {
    const test_message = {
      event_id: '001',
      payload: {
        image_id: 'wildlife_01',
        file_path: '/images/wildlife_0001',
        mode: null
      }
    };
    await worker.handleEvent('image.submitted', JSON.stringify(test_message))
    expect(publisher.publish).not.toHaveBeenCalled()
  });
  it('message is not object', async () => {
    const test_message = "TEST_STRING_SHOULD_NOT_BE_ACCEPTED";
    await worker.handleEvent('image.submitted', JSON.stringify(test_message))
    expect(publisher.publish).not.toHaveBeenCalled()
  });

  it('malformed JSON does not crash and does not publish', async () => {
    await worker.handleEvent('image.submitted', '{this is not valid json}');
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('duplicate event_id is not published twice', async () => {
    const test_message = {
      event_id: '001',
      payload: {
        image_id: 'wildlife_01',
        file_path: '/images/wildlife_0001',
        mode: 'index'
      }
    };
    redisClient.get
      .mockResolvedValueOnce(null)   // first: not seen before, process it
      .mockResolvedValueOnce('1');   // second: already processed, skip it
    // submitting the same event twice, should only be called once because handleEvent will take care of it
    await worker.handleEvent('image.submitted', JSON.stringify(test_message));
    await worker.handleEvent('image.submitted', JSON.stringify(test_message));
    expect(publisher.publish).toHaveBeenCalledTimes(1);
  });

  it('start() subscribes to image.submitted', async () => {
    await worker.start();
    expect(subscriber.subscribe).toHaveBeenCalledWith('image.submitted', expect.any(Function));
  });

  it('published payload contains required fields', async () => {
    const test_message = {
      event_id: '001',
      payload: {
        image_id: 'wildlife_01',
        file_path: '/images/wildlife_0001',
        mode: 'index'
      }
    };
    await worker.handleEvent('image.submitted', JSON.stringify(test_message));
    const published = JSON.parse(publisher.publish.mock.calls[0][1]);
    expect(published.event_id).toBe('001');
    expect(published.payload.image_id).toBe('wildlife_01');
    expect(published.payload.file_path).toBe('/images/wildlife_0001');
    expect(published.payload.mode).toBe('index');
  });
});




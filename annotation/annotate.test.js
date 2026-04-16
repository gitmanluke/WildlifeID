import { Annotate } from './annotate.js'
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

describe('Annotate', () => {
  const publisher  = { publish: jest.fn() };
  const subscriber = { subscribe: jest.fn() };
  const worker = new Annotate(subscriber, publisher);

  beforeEach(() => {
    publisher.publish.mockClear();
  });

  it('valid message', async () => {
    const test_message = {
      event_id: '001',
      payload: {
        image_id: 'wildlife_01',
        mode: 'index'
      }
    };
    await worker.handleEvent('image.uploaded', JSON.stringify(test_message));
    expect(publisher.publish).toHaveBeenCalledTimes(1);
  });

  it('message missing event id', async () => {
    const test_message = {
      event_id: null,
      payload: {
        image_id: 'wildlife_01',
        mode: 'index'
      }
    };
    await worker.handleEvent('image.uploaded', JSON.stringify(test_message));
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('message missing image id', async () => {
    const test_message = {
      event_id: '001',
      payload: {
        image_id: null,
        mode: 'index'
      }
    };
    await worker.handleEvent('image.uploaded', JSON.stringify(test_message));
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('message missing mode', async () => {
    const test_message = {
      event_id: '001',
      payload: {
        image_id: 'wildlife_01',
        mode: null
      }
    };
    await worker.handleEvent('image.uploaded', JSON.stringify(test_message));
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('malformed JSON does not crash and does not publish', async () => {
    await worker.handleEvent('image.uploaded', '{this is not valid json}');
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('start() subscribes to image.uploaded', async () => {
    await worker.start();
    expect(subscriber.subscribe).toHaveBeenCalledWith('image.uploaded', expect.any(Function));
  });

  it('published payload contains event_id, image_id, mode, and objects array', async () => {
    const test_message = {
      event_id: '001',
      payload: {
        image_id: 'wildlife_01',
        mode: 'index'
      }
    };
    await worker.handleEvent('image.uploaded', JSON.stringify(test_message));
    const published = JSON.parse(publisher.publish.mock.calls[0][1]);
    expect(published.event_id).toBe('001');
    expect(published.payload.image_id).toBe('wildlife_01');
    expect(published.payload.mode).toBe('index');
    expect(Array.isArray(published.payload.objects)).toBe(true);
  });
});

import { Embed } from './embed.js'
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

describe('Embed', () => {
  const publisher  = { publish: jest.fn() };
  const subscriber = { subscribe: jest.fn() };
  const worker = new Embed(subscriber, publisher);

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
    await worker.handleEvent('annotation.complete', JSON.stringify(test_message));
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
    await worker.handleEvent('annotation.complete', JSON.stringify(test_message));
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
    await worker.handleEvent('annotation.complete', JSON.stringify(test_message));
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
    await worker.handleEvent('annotation.complete', JSON.stringify(test_message));
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('malformed JSON does not crash and does not publish', async () => {
    await worker.handleEvent('annotation.complete', '{this is not valid json}');
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('start() subscribes to annotation.complete', async () => {
    await worker.start();
    expect(subscriber.subscribe).toHaveBeenCalledWith('annotation.complete', expect.any(Function));
  });

  it('published payload contains event_id, image_id, mode, and embedding', async () => {
    const test_message = {
      event_id: '001',
      payload: {
        image_id: 'wildlife_01',
        mode: 'index'
      }
    };
    await worker.handleEvent('annotation.complete', JSON.stringify(test_message));
    const published = JSON.parse(publisher.publish.mock.calls[0][1]);
    expect(published.event_id).toBe('001');
    expect(published.payload.image_id).toBe('wildlife_01');
    expect(published.payload.mode).toBe('index');
    expect(published.payload.embedding).toBeDefined();
  });
});

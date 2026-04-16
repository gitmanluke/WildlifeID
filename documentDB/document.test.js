import { Document } from './document.js'
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

describe('Document', () => {
  const publisher  = { publish: jest.fn() };
  const subscriber = { subscribe: jest.fn() };
  const worker = new Document(subscriber, publisher);

  beforeEach(() => {
    publisher.publish.mockClear();
  });

  // annotation.complete channel (write path)
  it('valid annotation.complete message', async () => {
    const test_message = {
      event_id: '001',
      payload: {
        image_id: 'wildlife_01'
      }
    };
    // document has no output — just verify it does not throw
    await expect(
      worker.handleEvent('annotation.complete', JSON.stringify(test_message))
    ).resolves.not.toThrow();
  });

  it('annotation.complete missing event id', async () => {
    const test_message = {
      event_id: null,
      payload: {
        image_id: 'wildlife_01'
      }
    };
    await expect(
      worker.handleEvent('annotation.complete', JSON.stringify(test_message))
    ).resolves.not.toThrow();
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('annotation.complete missing image id', async () => {
    const test_message = {
      event_id: '001',
      payload: {
        image_id: null
      }
    };
    await expect(
      worker.handleEvent('annotation.complete', JSON.stringify(test_message))
    ).resolves.not.toThrow();
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  // objects.submitted channel (read path)
  it('valid objects.submitted message', async () => {
    const test_message = {
      event_id: '002',
      payload: {
        image_ids: ['img_1042', 'img_0891']
      }
    };
    await expect(
      worker.handleEvent('objects.submitted', JSON.stringify(test_message))
    ).resolves.not.toThrow();
  });

  it('objects.submitted missing event id', async () => {
    const test_message = {
      event_id: null,
      payload: {
        image_ids: ['img_1042', 'img_0891']
      }
    };
    await expect(
      worker.handleEvent('objects.submitted', JSON.stringify(test_message))
    ).resolves.not.toThrow();
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('objects.submitted missing image ids', async () => {
    const test_message = {
      event_id: '002',
      payload: {
        image_ids: null
      }
    };
    await expect(
      worker.handleEvent('objects.submitted', JSON.stringify(test_message))
    ).resolves.not.toThrow();
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('malformed JSON does not crash', async () => {
    await expect(
      worker.handleEvent('annotation.complete', '{this is not valid json}')
    ).resolves.not.toThrow();
  });

  it('start() subscribes to both input channels', async () => {
    await worker.start();
    expect(subscriber.subscribe).toHaveBeenCalledWith('annotation.complete', expect.any(Function));
    expect(subscriber.subscribe).toHaveBeenCalledWith('objects.submitted', expect.any(Function));
  });
});

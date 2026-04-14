import { Vector } from './vector.js'
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

describe('Vector', () => {
  const publisher  = { publish: jest.fn() };
  const subscriber = { subscribe: jest.fn() };
  const worker = new Vector(subscriber, publisher);

  beforeEach(() => {
    publisher.publish.mockClear();
  });

  it('valid message (query mode publishes results)', async () => {
    const test_message = {
      event_id: '001',
      payload: {
        image_id: 'wildlife_01',
        mode: 'query',
        embedding: 'PLACEHOLDER_VECTOR_EMBEDDING'
      }
    };
    await worker.handleEvent('embedding.complete', JSON.stringify(test_message));
    expect(publisher.publish).toHaveBeenCalledTimes(1);
  });

  it('valid message (index mode does not publish)', async () => {
    const test_message = {
      event_id: '001',
      payload: {
        image_id: 'wildlife_01',
        mode: 'index',
        embedding: 'PLACEHOLDER_VECTOR_EMBEDDING'
      }
    };
    await worker.handleEvent('embedding.complete', JSON.stringify(test_message));
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('message missing event id', async () => {
    const test_message = {
      event_id: null,
      payload: {
        image_id: 'wildlife_01',
        mode: 'query',
        embedding: 'PLACEHOLDER_VECTOR_EMBEDDING'
      }
    };
    await worker.handleEvent('embedding.complete', JSON.stringify(test_message));
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('message missing image id', async () => {
    const test_message = {
      event_id: '001',
      payload: {
        image_id: null,
        mode: 'query',
        embedding: 'PLACEHOLDER_VECTOR_EMBEDDING'
      }
    };
    await worker.handleEvent('embedding.complete', JSON.stringify(test_message));
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('message missing mode', async () => {
    const test_message = {
      event_id: '001',
      payload: {
        image_id: 'wildlife_01',
        mode: null,
        embedding: 'PLACEHOLDER_VECTOR_EMBEDDING'
      }
    };
    await worker.handleEvent('embedding.complete', JSON.stringify(test_message));
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('message missing embedding', async () => {
    const test_message = {
      event_id: '001',
      payload: {
        image_id: 'wildlife_01',
        mode: 'query',
        embedding: null
      }
    };
    await worker.handleEvent('embedding.complete', JSON.stringify(test_message));
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});

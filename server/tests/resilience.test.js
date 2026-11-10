import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import Activity from '../src/models/Activity.js';
import {
  getUserSeenKeys,
  markSeen,
  forgetSeenKeys,
  clearSeenKeysCache
} from '../src/services/seenKeys.js';
import { errorHandler } from '../src/middleware/error.js';

const setReadyState = (value) =>
  Object.defineProperty(mongoose.connection, 'readyState', { value, configurable: true });

const resolvingFind = (docs) => jest.spyOn(Activity, 'find').mockReturnValue({ lean: () => Promise.resolve(docs) });

describe('seen-quest lookup never stalls suggestions', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete mongoose.connection.readyState; // back to the real getter
    clearSeenKeysCache();
  });

  it('queries once, then answers from memory', async () => {
    setReadyState(1);
    const find = resolvingFind([{ apiKey: 'a' }, { apiKey: 'b' }]);

    const first = await getUserSeenKeys('user-1');
    const second = await getUserSeenKeys('user-1');

    expect([...first].sort()).toEqual(['a', 'b']);
    expect(second).toBe(first);
    expect(find).toHaveBeenCalledTimes(1);
  });

  it('knows about a quest the moment it is saved, without another query', async () => {
    setReadyState(1);
    const find = resolvingFind([{ apiKey: 'a' }]);

    await getUserSeenKeys('user-1');
    markSeen('user-1', 'c');

    expect((await getUserSeenKeys('user-1')).has('c')).toBe(true);
    expect(find).toHaveBeenCalledTimes(1);
  });

  it('rebuilds the list after a quest is removed', async () => {
    setReadyState(1);
    const find = resolvingFind([{ apiKey: 'a' }]);

    await getUserSeenKeys('user-1');
    forgetSeenKeys('user-1');
    await getUserSeenKeys('user-1');

    expect(find).toHaveBeenCalledTimes(2);
  });

  it('does not touch the database while it is disconnected', async () => {
    setReadyState(0);
    const find = resolvingFind([{ apiKey: 'a' }]);

    const started = Date.now();
    const keys = await getUserSeenKeys('user-1');

    expect(keys.size).toBe(0);
    expect(find).not.toHaveBeenCalled();
    expect(Date.now() - started).toBeLessThan(200);
  });

  it('gives up after a short time instead of waiting for a stuck query', async () => {
    setReadyState(1);
    jest.spyOn(Activity, 'find').mockReturnValue({ lean: () => new Promise(() => {}) }); // never answers

    const started = Date.now();
    const keys = await getUserSeenKeys('user-1');

    expect(keys.size).toBe(0);
    expect(Date.now() - started).toBeLessThan(3000);
  });

  it('treats a failed query as "nothing seen" rather than an error', async () => {
    setReadyState(1);
    jest.spyOn(Activity, 'find').mockReturnValue({ lean: () => Promise.reject(new Error('boom')) });

    await expect(getUserSeenKeys('user-1')).resolves.toEqual(new Set());
  });

  it('works for guests without any lookup', async () => {
    const find = resolvingFind([]);
    expect((await getUserSeenKeys(undefined)).size).toBe(0);
    expect(find).not.toHaveBeenCalled();
  });
});

describe('error handler', () => {
  const run = (err) => {
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      }
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
    errorHandler(err, { method: 'GET', originalUrl: '/api/x' }, res, () => {});
    return res;
  };

  afterEach(() => jest.restoreAllMocks());

  it('answers 503 with a plain message when MongoDB is unreachable', () => {
    const err = Object.assign(new Error('Server selection timed out after 5000 ms'), {
      name: 'MongooseServerSelectionError'
    });
    const res = run(err);
    expect(res.statusCode).toBe(503);
    expect(res.body.message).toMatch(/can't reach the database/i);
    expect(res.body.stack).toBeUndefined();
  });

  it('recognises a buffering timeout as a database outage too', () => {
    const res = run(new Error('Operation `activities.find()` buffering timed out after 5000ms'));
    expect(res.statusCode).toBe(503);
  });

  it('leaves ordinary errors alone', () => {
    const res = run(Object.assign(new Error('Bad thing'), { statusCode: 400 }));
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Bad thing');
  });
});

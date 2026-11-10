import http from 'node:http';
import net from 'node:net';
import { jest } from '@jest/globals';
import axios from 'axios';

// In ESM Jest, we spy on methods instead of jest.mock('axios')
import app from '../src/app.js';
import { clearSuggestionCache } from '../src/services/boredApi.js';
import { generateToken } from '../src/middleware/auth.js';

const mockUser = {
  _id: 'user_suggestion_test',
  name: 'Suggestion Tester',
  email: 'tester@example.com'
};
const authToken = generateToken(mockUser);

const requestApp = (method, url, { token = authToken } = {}) => {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = { host: 'localhost' };
    if (token) req.headers.authorization = `Bearer ${token}`;

    const res = new http.ServerResponse(req);
    let payload = '';

    res.write = (chunk) => {
      if (chunk) payload += chunk.toString();
      return true;
    };

    res.end = (chunk) => {
      if (chunk) payload += chunk.toString();
      let parsedBody = payload;
      try {
        parsedBody = JSON.parse(payload);
      } catch (e) {
        // preserve string
      }
      resolve({
        status: res.statusCode,
        headers: res.getHeaders(),
        body: parsedBody
      });
    };

    app.handle(req, res, (err) => {
      if (err) reject(err);
    });
  });
};

describe('Suggestions API Endpoints', () => {
  let axiosGetSpy;

  beforeEach(() => {
    clearSuggestionCache();
    if (axiosGetSpy) axiosGetSpy.mockRestore();
  });

  afterEach(() => {
    if (axiosGetSpy) axiosGetSpy.mockRestore();
  });

  const mockActivity = {
    activity: 'Teach a dog a new trick',
    availability: 0.15,
    type: 'education',
    participants: 1,
    price: 0.05,
    accessibility: 'Few to no challenges',
    duration: 'hours',
    kidFriendly: true,
    link: 'https://example.com/trick',
    key: '1234567'
  };

  it('GET /api/suggestions/random should return single activity without filters', async () => {
    axiosGetSpy = jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: [mockActivity] });

    const res = await requestApp('GET', '/api/suggestions/random');
    expect(res.status).toBe(200);
    expect(res.body.activity).toBe('Teach a dog a new trick');
    expect(res.body.priceLabel).toBe('Cheap');
    expect(res.body.availabilityLabel).toBe('Rare');
  });

  it('GET /api/suggestions/random works without logging in', async () => {
    axiosGetSpy = jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: [mockActivity] });

    const res = await requestApp('GET', '/api/suggestions/random', { token: null });
    expect(res.status).toBe(200);
    expect(res.body.activity).toBe('Teach a dog a new trick');
  });

  it('GET /api/suggestions/random treats an invalid token as anonymous', async () => {
    axiosGetSpy = jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: [mockActivity] });

    const res = await requestApp('GET', '/api/suggestions/random', { token: 'not-a-jwt' });
    expect(res.status).toBe(200);
  });

  it('loads the catalogue once, then answers every request from memory', async () => {
    const catalogue = [
      mockActivity,
      { ...mockActivity, key: 'social-1', type: 'social', participants: 2 },
      { ...mockActivity, key: 'cook-1', type: 'cooking', participants: 4 }
    ];
    axiosGetSpy = jest.spyOn(axios, 'get').mockResolvedValue({ data: catalogue });

    for (let i = 0; i < 5; i++) {
      expect((await requestApp('GET', '/api/suggestions/random')).status).toBe(200);
    }
    // Different filters are applied locally too, with no further upstream calls.
    const social = await requestApp('GET', '/api/suggestions/random?type=social');
    expect(social.body.key).toBe('social-1');
    const pair = await requestApp('GET', '/api/suggestions/browse?participants=2');
    expect(pair.body.map((a) => a.key)).toEqual(['social-1']);

    expect(axiosGetSpy).toHaveBeenCalledTimes(1);
    expect(axiosGetSpy.mock.calls[0][0]).toMatch(/\/filter$/);
  });

  it('shares one upstream request between simultaneous cold-start visitors', async () => {
    axiosGetSpy = jest.spyOn(axios, 'get').mockResolvedValue({ data: [mockActivity] });

    const results = await Promise.all(
      Array.from({ length: 4 }, () => requestApp('GET', '/api/suggestions/random', { token: null }))
    );
    expect(results.every((r) => r.status === 200)).toBe(true);
    expect(axiosGetSpy).toHaveBeenCalledTimes(1);
  });

  it('GET /api/suggestions/random retries once when the upstream times out', async () => {
    const timeout = Object.assign(new Error('timeout of 5000ms exceeded'), { code: 'ECONNABORTED' });
    axiosGetSpy = jest
      .spyOn(axios, 'get')
      .mockRejectedValueOnce(timeout)
      .mockResolvedValueOnce({ data: [mockActivity] });

    const res = await requestApp('GET', '/api/suggestions/random');
    expect(res.status).toBe(200);
    expect(axiosGetSpy).toHaveBeenCalledTimes(2);
  });

  it('keeps answering from the old catalogue when a background refresh fails', async () => {
    const timeout = Object.assign(new Error('timeout of 5000ms exceeded'), { code: 'ECONNABORTED' });
    axiosGetSpy = jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: [mockActivity] })
      .mockRejectedValue(timeout);

    const first = await requestApp('GET', '/api/suggestions/random');
    expect(first.status).toBe(200);

    // Seven hours later the catalogue is stale: the request is still answered immediately.
    const realNow = Date.now();
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(realNow + 7 * 60 * 60 * 1000);
    try {
      const second = await requestApp('GET', '/api/suggestions/random');
      expect(second.status).toBe(200);
      expect(second.body.activity).toBe('Teach a dog a new trick');
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('GET /api/suggestions/random says so when the user has seen every quest', async () => {
    axiosGetSpy = jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: [] });

    const res = await requestApp('GET', '/api/suggestions/random');
    // An empty upstream answer is never cached, so the catalogue stays empty and nothing matches.
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/every quest/i);
  });

  it('GET /api/suggestions/random returns 503 when the upstream keeps failing', async () => {
    const timeout = Object.assign(new Error('timeout of 5000ms exceeded'), { code: 'ECONNABORTED' });
    axiosGetSpy = jest.spyOn(axios, 'get').mockRejectedValue(timeout);

    const res = await requestApp('GET', '/api/suggestions/random');
    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/try again/i);
  });

  it('GET /api/suggestions/random should reject invalid type with 400', async () => {
    const res = await requestApp('GET', '/api/suggestions/random?type=invalid_type');
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid type');
  });

  it('GET /api/suggestions/random should reject invalid participants (e.g. 7) with 400', async () => {
    const res = await requestApp('GET', '/api/suggestions/random?participants=7');
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid participants count');
  });

  it('GET /api/suggestions/random with filter returns an item from the array', async () => {
    axiosGetSpy = jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: [mockActivity] });

    const res = await requestApp('GET', '/api/suggestions/random?type=education&participants=1');
    expect(res.status).toBe(200);
    expect(res.body.key).toBe('1234567');
  });

  it('GET /api/suggestions/random should return 404 when filter array is empty', async () => {
    axiosGetSpy = jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: [] });

    const res = await requestApp('GET', '/api/suggestions/random?type=cooking&participants=8');
    expect(res.status).toBe(404);
    expect(res.body.message).toContain('No activities found matching your filters');
  });

  it('GET /api/suggestions/random with maxDuration=minutes only returns quick activities', async () => {
    const quick = { ...mockActivity, key: 'quick-1', duration: 'minutes' };
    const long = { ...mockActivity, key: 'long-1', duration: 'days' };
    axiosGetSpy = jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: [long, quick] });

    const res = await requestApp('GET', '/api/suggestions/random?maxDuration=minutes');
    expect(res.status).toBe(200);
    expect(res.body.key).toBe('quick-1');
  });

  it('GET /api/suggestions/random returns 404 when nothing fits maxDuration', async () => {
    const long = { ...mockActivity, key: 'long-1', duration: 'days' };
    axiosGetSpy = jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: [long] });

    const res = await requestApp('GET', '/api/suggestions/random?maxDuration=minutes');
    expect(res.status).toBe(404);
  });

  it('GET /api/suggestions/random should reject invalid maxDuration with 400', async () => {
    const res = await requestApp('GET', '/api/suggestions/random?maxDuration=forever');
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid maxDuration');
  });

  it('GET /api/suggestions/browse returns full list of filtered activities', async () => {
    axiosGetSpy = jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: [mockActivity] });

    const res = await requestApp('GET', '/api/suggestions/browse?type=education');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].key).toBe('1234567');
  });
});

import http from 'node:http';
import net from 'node:net';
import { jest } from '@jest/globals';
import app from '../src/app.js';
import Challenge from '../src/models/Challenge.js';
import Activity from '../src/models/Activity.js';
import { generateToken } from '../src/middleware/auth.js';

const mockUser = {
  _id: 'user_challenger',
  name: 'Challenger',
  email: 'challenger@example.com'
};
const authToken = generateToken(mockUser);

const requestApp = (method, url, { body, token = authToken } = {}) => {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;

    const bodyStr = body ? JSON.stringify(body) : '';
    req.headers = {
      host: 'localhost',
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(bodyStr),
      ...(token ? { authorization: `Bearer ${token}` } : {})
    };

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

    process.nextTick(() => {
      if (bodyStr) req.push(bodyStr);
      req.push(null);
    });

    app.handle(req, res, (err) => {
      if (err) reject(err);
    });
  });
};

describe('Challenges API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/challenges/current returns null when no active challenge', async () => {
    jest.spyOn(Challenge, 'findOne').mockReturnValueOnce({
      populate: jest.fn().mockResolvedValue(null)
    });

    const res = await requestApp('GET', '/api/challenges/current');
    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it('POST /api/challenges creates auto challenge from saved activities', async () => {
    jest.spyOn(Challenge, 'findOne').mockReturnValueOnce({
      populate: jest.fn().mockResolvedValue(null)
    });

    const mockSaved = [
      { _id: 'act_1', activity: 'Read chapter 1', status: 'saved' },
      { _id: 'act_2', activity: 'Do 20 pushups', status: 'saved' },
      { _id: 'act_3', activity: 'Bake cookies', status: 'saved' }
    ];

    jest.spyOn(Activity, 'find')
      .mockImplementationOnce(() => ({
        limit: jest.fn().mockResolvedValue(mockSaved)
      }))
      .mockResolvedValueOnce(mockSaved);

    jest.spyOn(Challenge, 'create').mockResolvedValueOnce({
      _id: 'ch_1',
      goal: 3,
      completedCount: 0,
      status: 'active',
      populate: jest.fn().mockResolvedValue({
        _id: 'ch_1',
        goal: 3,
        completedCount: 0,
        status: 'active',
        activities: mockSaved
      })
    });

    const res = await requestApp('POST', '/api/challenges', {
      body: { auto: true, count: 3 }
    });

    expect(res.status).toBe(201);
    expect(res.body.goal).toBe(3);
    expect(res.body.status).toBe('active');
  });
});

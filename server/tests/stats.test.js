import http from 'node:http';
import net from 'node:net';
import { jest } from '@jest/globals';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Activity from '../src/models/Activity.js';
import { generateToken } from '../src/middleware/auth.js';

const mockUser = {
  _id: 'user_stats_1',
  name: 'Stats Hunter',
  email: 'stats@example.com',
  xp: 150,
  streak: 4,
  badges: ['First Step'],
  save: jest.fn().mockResolvedValue(true)
};
const authToken = generateToken(mockUser);

const requestApp = (method, url) => {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = {
      host: 'localhost',
      authorization: `Bearer ${authToken}`
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
      req.push(null);
    });

    app.handle(req, res, (err) => {
      if (err) reject(err);
    });
  });
};

describe('Stats API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/stats returns comprehensive user statistics and badges', async () => {
    jest.spyOn(User, 'findById').mockResolvedValueOnce(mockUser);
    jest.spyOn(Activity, 'find').mockResolvedValueOnce([
      { status: 'done', type: 'social', completedAt: new Date() },
      { status: 'done', type: 'education', completedAt: new Date() },
      { status: 'saved', type: 'recreational' }
    ]);

    const res = await requestApp('GET', '/api/stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('xp', 150);
    expect(res.body).toHaveProperty('streak', 4);
    expect(res.body.totalCompleted).toBe(2);
    expect(res.body.totalSaved).toBe(1);
    expect(Array.isArray(res.body.byType)).toBe(true);
    expect(Array.isArray(res.body.last7Days)).toBe(true);
    expect(Array.isArray(res.body.allBadgeDefinitions)).toBe(true);
  });
});


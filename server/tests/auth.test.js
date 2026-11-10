import http from 'node:http';
import net from 'node:net';
import { jest } from '@jest/globals';
import app from '../src/app.js';
import User from '../src/models/User.js';

const requestApp = (method, url, { body, headers = {} } = {}) => {
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
      ...headers
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
      if (bodyStr) {
        req.push(bodyStr);
      }
      req.push(null);
    });

    app.handle(req, res, (err) => {
      if (err) reject(err);
    });
  });
};

describe('Auth API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/auth/register should create user and return token', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);
    jest.spyOn(User, 'hashPassword').mockResolvedValueOnce('hashed_pwd_123');
    jest.spyOn(User, 'create').mockResolvedValueOnce({
      _id: 'user_123',
      name: 'Alex Hunter',
      email: 'alex@example.com',
      xp: 0,
      streak: 0,
      badges: []
    });

    const res = await requestApp('POST', '/api/auth/register', {
      body: {
        name: 'Alex Hunter',
        email: 'alex@example.com',
        password: 'password123'
      }
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('alex@example.com');
  });

  it('POST /api/auth/register rejects duplicate emails with 400', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValueOnce({ _id: 'existing_id' });

    const res = await requestApp('POST', '/api/auth/register', {
      body: {
        name: 'Alex Hunter',
        email: 'alex@example.com',
        password: 'password123'
      }
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already exists');
  });

  it('POST /api/auth/login validates credentials correctly', async () => {
    const mockUser = {
      _id: 'user_123',
      name: 'Alex Hunter',
      email: 'alex@example.com',
      xp: 10,
      streak: 2,
      badges: [],
      comparePassword: jest.fn().mockResolvedValue(true)
    };

    jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);

    const res = await requestApp('POST', '/api/auth/login', {
      body: {
        email: 'alex@example.com',
        password: 'password123'
      }
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.name).toBe('Alex Hunter');
  });

  it('GET /api/auth/me rejects requests without token with 401', async () => {
    const res = await requestApp('GET', '/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Access denied');
  });
});

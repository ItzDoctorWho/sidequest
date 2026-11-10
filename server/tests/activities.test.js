import http from 'node:http';
import net from 'node:net';
import { jest } from '@jest/globals';
import app from '../src/app.js';
import Activity from '../src/models/Activity.js';
import User from '../src/models/User.js';
import { generateToken } from '../src/middleware/auth.js';

const mockUser = {
  _id: 'user_456',
  name: 'Sam Fisher',
  email: 'sam@example.com'
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

describe('Activities API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/activities requires authentication', async () => {
    const res = await requestApp('GET', '/api/activities', { token: null });
    expect(res.status).toBe(401);
  });

  it('POST /api/activities successfully saves an activity', async () => {
    jest.spyOn(Activity, 'findOne').mockResolvedValueOnce(null);
    jest.spyOn(Activity, 'create').mockResolvedValueOnce({
      _id: 'act_1',
      user: 'user_456',
      apiKey: 'key_123',
      activity: 'Paint a landscape',
      type: 'recreational',
      participants: 1,
      status: 'saved'
    });

    const res = await requestApp('POST', '/api/activities', {
      body: {
        apiKey: 'key_123',
        activity: 'Paint a landscape',
        type: 'recreational',
        participants: 1
      }
    });

    expect(res.status).toBe(201);
    expect(res.body.activity).toBe('Paint a landscape');
    expect(res.body.status).toBe('saved');
  });

  it('POST /api/activities prevents saving duplicates with 400', async () => {
    jest.spyOn(Activity, 'findOne').mockResolvedValueOnce({ _id: 'existing_act' });

    const res = await requestApp('POST', '/api/activities', {
      body: {
        apiKey: 'key_123',
        activity: 'Paint a landscape',
        type: 'recreational',
        participants: 1
      }
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already added or saved');
  });

  it('PATCH /api/activities/:id updates status and awards XP when marked done', async () => {
    const mockActivity = {
      _id: 'act_1',
      user: 'user_456',
      status: 'saved',
      save: jest.fn().mockResolvedValue(true)
    };

    jest.spyOn(Activity, 'findOne').mockResolvedValueOnce(mockActivity);
    const userUpdateSpy = jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce({});

    const res = await requestApp('PATCH', '/api/activities/act_1', {
      body: { status: 'done', rating: 5, notes: 'Felt great!' }
    });

    expect(res.status).toBe(200);
    expect(mockActivity.status).toBe('done');
    expect(mockActivity.rating).toBe(5);
    expect(userUpdateSpy).toHaveBeenCalledWith(
      'user_456',
      expect.objectContaining({ $inc: { xp: 15 } })
    );
  });

  it('DELETE /api/activities/:id deletes the user activity', async () => {
    jest.spyOn(Activity, 'findOneAndDelete').mockResolvedValueOnce({ _id: 'act_1' });

    const res = await requestApp('DELETE', '/api/activities/act_1');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('removed successfully');
  });
});


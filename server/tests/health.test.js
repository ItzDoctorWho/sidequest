import http from 'node:http';
import net from 'node:net';
import app from '../src/app.js';

const requestApp = (method, url) => {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = { host: 'localhost' };

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
        // preserve string if not json
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

describe('Boredom Buster API Route Dispatcher', () => {
  it('GET /api/health should return 200 with ok status', async () => {
    const res = await requestApp('GET', '/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'Boredom Buster API');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/unknown-endpoint should return 404', async () => {
    const res = await requestApp('GET', '/api/unknown-endpoint');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('Route not found');
  });
});

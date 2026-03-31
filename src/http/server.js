import http from 'node:http';

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('invalid_json'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(data));
}

export function createServer({ activityService, battleService }) {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return sendJson(res, 401, { error: 'missing_user' });
    }

    if (req.method === 'POST' && url.pathname === '/activity/ingest') {
      try {
        const body = await readJson(req);
        const events = body.events;
        if (!Array.isArray(events) || events.length === 0) {
          return sendJson(res, 400, { error: 'events_required' });
        }
        const result = await activityService.ingest(userId, events);
        return sendJson(res, 200, result);
      } catch (err) {
        if (String(err.message).startsWith('validation_error')) {
          return sendJson(res, 400, { error: err.message });
        }
        if (err.message === 'invalid_json') {
          return sendJson(res, 400, { error: 'invalid_json' });
        }
        return sendJson(res, 500, { error: 'internal_error' });
      }
    }

    if (req.method === 'GET' && url.pathname === '/activity/history') {
      const cursor = url.searchParams.get('cursor');
      const limitParam = url.searchParams.get('limit');
      const limit = limitParam ? Number(limitParam) : 30;
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        return sendJson(res, 400, { error: 'invalid_limit' });
      }
      const result = await activityService.history(userId, { cursor, limit });
      return sendJson(res, 200, result);
    }

    if (req.method === 'POST' && url.pathname === '/battle/start') {
      try {
        const body = await readJson(req);
        const result = await battleService.start(userId, body);
        return sendJson(res, 200, result);
      } catch (err) {
        if (String(err.message).startsWith('validation_error')) {
          return sendJson(res, 400, { error: err.message });
        }
        if (err.message === 'insufficient_meta_stamina') {
          return sendJson(res, 409, { error: err.message });
        }
        if (err.message === 'battle_already_active') {
          return sendJson(res, 409, { error: err.message });
        }
        if (err.message === 'invalid_json') {
          return sendJson(res, 400, { error: 'invalid_json' });
        }
        return sendJson(res, 500, { error: 'internal_error' });
      }
    }

    if (req.method === 'GET' && url.pathname.startsWith('/battle/result/')) {
      try {
        const battleId = url.pathname.replace('/battle/result/', '');
        const result = await battleService.result(userId, battleId);
        return sendJson(res, 200, result);
      } catch (err) {
        if (err.message === 'battle_not_found') {
          return sendJson(res, 404, { error: err.message });
        }
        return sendJson(res, 500, { error: 'internal_error' });
      }
    }

    return sendJson(res, 404, { error: 'not_found' });
  });
}
